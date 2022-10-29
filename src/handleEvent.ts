import axios from "axios";
import * as dotenv from "dotenv";
import {
  addReceiverId,
  removeReceiverId,
  plusProcess,
  getVariables,
} from "./announcer";
import { replyText, getSender, getName } from "./client";
import { constants } from "./constants";
const { PROCESS_FILE_NAME } = constants;
const env = dotenv.config().parsed;
const config = {
  headers: {
    Authorization: `Bearer ${
      env.NODE_ENV === "development" ? env.ACCESS_TOKEN_DEMO : env.ACCESS_TOKEN
    }`,
  },
};

function initHandleEvent() {}
function addReceiverReplyText(result: number | Array<number | string>) {
  return result === -1
    ? `ตอนนี้เลยเวลา Slot สุดท้ายของวันนี้แล้ว ไว้เรียกเราในวันอื่นน้า😴`
    : `เดี๋ยวจะเริ่มประกาศแล้วนะงับ😉\nSlot ถัดไป #${result[0]} เริ่ม ${result[1]} น้า`;
}
const handleEvent = async (event) => {
  if (
    event.type == "message" &&
    event.message.type === "text" &&
    event.message.text.charAt(0) === "!" &&
    event.message.text.replaceAll("!", "").trim().length > 0
  ) {
    const timeStamp = new Date(event.timestamp);
    const id =
      event.source.type === "group"
        ? event.source.groupId
        : event.source.userId;
    const sender = await getSender(
      event.source.type === "group" ? event.source.groupId : null,
      event.source.userId
    );
    const name = await getName(id);
    let commandMessage = "Unknown Command";
    if (event.message.text.substring(1, 6) === "start") {
      commandMessage = event.message.text.substring(1);
      const result = addReceiverId(
        id,
        event.message.text.split(" ").slice(1),
        name
      );
      if (result !== null) {
        await replyText(event.replyToken, addReceiverReplyText(result));
      }
    } else if (event.message.text.substring(1, 5) === "stop") {
      commandMessage = "stop";
      const success = removeReceiverId(id);
      await replyText(
        event.replyToken,
        success ? "บ๊ายบาย ไว้เจอกันอีกน้า👋" : "เรียก👉 !start ก่อนนะงับ"
      );
    } else if (
      event.message.text.substring(1, 2) === "+" ||
      event.message.text.substring(1, 2) === "-"
    ) {
      try {
        const op = event.message.text.substring(1, 2);
        const arg = event.message.text.split(" ");
        const result = await plusProcess(
          arg,
          op === "-" ? true : false,
          sender,
          id,
          name
        );
        commandMessage = op + " " + arg[1] + " " + arg[2];
        if (result !== null) {
          await replyText(event.replyToken, addReceiverReplyText(result));
        }
      } catch (err) {
        await replyText(
          event.replyToken,
          'ใส่คำสั่งบวกโปรเซสผิดงับ❌\nต้องแบบนี้น้า✔️ "!+ <minutes> <now/next/Slot No> " หรือ "!- <minutes> <now/next/Slot No> "'
        );
      }
    } else if (event.message.text.substring(1, 9) === "filename") {
      commandMessage = "filename";
      await replyText(
        event.replyToken,
        "📁ตอนนี้ Process เป็นไฟล์ `" + PROCESS_FILE_NAME + "` งับ"
      );
    } else if (event.message.text.substring(1, 6) === "debug") {
      commandMessage = "debug";
      const variables = getVariables();
      try {
        const [
          intervalId,
          receivers,
          totalSlots,
          idx,
          totalShift,
          nextSlotShift,
          currentTime,
          nextSlotTime,
        ] = variables;
        const nextSlotDate = new Date(0);
        nextSlotDate.setMinutes(Math.min(nextSlotTime, 23 * 60 + 59));
        const currentDate = new Date(0);
        currentDate.setMinutes(Math.min(currentTime, 23 * 60 + 59));
        const text = `Interval: ${
          intervalId ? `Running (${intervalId})` : "Rest"
        }\nReceivers: ${receivers}\nidx: ${idx}/${totalSlots}\n+-Process: ${totalShift} min\n+-Next Slot: ${nextSlotShift} min\nCurrent Time: ${currentDate
          .toISOString()
          .substring(11, 16)}\nNext Slot: ${nextSlotDate
          .toISOString()
          .substring(11, 16)}`;
        console.log(text.split("\n").toString());
        await replyText(event.replyToken, text);
      } catch (e) {
        console.log(e);
        await replyText(event.replyToken, "!debug มีปัญหางับ มาเช็กด่วน ๆ");
      }
    } else if (event.message.text.substring(1, 6) === "quota") {
      commandMessage = "quota";
      const usage = await axios
        .get("https://api.line.me/v2/bot/message/quota/consumption", config)
        .catch();
      const quota = await axios
        .get("https://api.line.me/v2/bot/message/quota/", config)
        .catch();
      const text = `Usage: ${
        usage.status === 200 ? usage.data.totalUsage : null
      }/${quota.status === 200 ? quota.data.value : null}\nType: ${
        quota.status === 200 ? quota.data.type : null
      }`;
      await replyText(event.replyToken, text);
    } else if (event.message.text.substring(1, 5) === "help") {
      commandMessage = "help";
      await replyText(
        event.replyToken,
        "พิมพ์ !start เพื่อเริ่มการใช้งาน\nหรือ !stop เพื่อหยุดการใช้งาน\nส่วนคู่มือแบบเต็ม ๆ ก็อันนี้เลยยย https://docs.google.com/document/d/1rs-aK5OV9isvC4HrIy0Rb4q3cD8NZsXymxfuG3JBWhs/edit?usp=sharing"
      );
    } else {
      await replyText(event.replyToken, "ไม่เข้าใจคำสั่งอ่า ขอโทษทีน้า 😢");
      return;
    }
    console.log(
      timeStamp.toLocaleString(),
      sender,
      "in",
      id.charAt(0) === "U" ? "private chat" : name,
      commandMessage
    );
  }
  return;
};
export { handleEvent, initHandleEvent };
