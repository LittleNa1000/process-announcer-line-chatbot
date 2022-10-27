import axios from "axios";
import * as dotenv from "dotenv";
import {
  addReceiverId,
  removeReceiverId,
  plusProcess,
  getVar,
} from "./announcer";
import { replyText, getSender, getName } from "./client";
import { constants } from "./constants";
const { PROCESS_FILE_NAME } = constants;
const env = dotenv.config().parsed;
const config = {
  headers: { Authorization: `Bearer ${env.ACCESS_TOKEN_DEMO}` },
};

function initHandleEvent() {}
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
    console.log(
      timeStamp.toLocaleString(),
      sender,
      "at",
      name,
      event.message.text
    );
    if (event.message.text.substring(1, 6) === "start") {
      const result = addReceiverId(
        id,
        event.message.text.split(" ").slice(1),
        name
      );
      if (result !== null) {
        await replyText(
          event.replyToken,
          result === -1
            ? `ตอนนี้เลยเวลา Slot สุดท้ายของวันนี้แล้ว ไว้เรียกเราในวันอื่นน้า😴`
            : `เริ่มประกาศตั้งแต่ Slot #${result[0]} ตอน ${result[1]} น้า😉`
        );
      }
    } else if (event.message.text.substring(1, 5) === "stop") {
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
        const result = await plusProcess(
          event.message.text.split(" "),
          op === "-" ? true : false,
          sender,
          id,
          name
        );
        if (result !== null) {
          await replyText(
            event.replyToken,
            result === -1
              ? `ตอนนี้เลยเวลา Slot สุดท้ายของวันนี้แล้ว ไว้เรียกเราในวันอื่นน้า😴`
              : `เริ่มประกาศตั้งแต่ Slot #${result[0]} ตอน ${result[1]} น้า😉`
          );
        }
      } catch (err) {
        await replyText(
          event.replyToken,
          'ใส่คำสั่งบวกโปรเซสผิดงับ❌\nต้องแบบนี้น้า✔️ "!+ (นาที) (Slot)" หรือ "!- (นาที) (Slot)"'
        );
      }
    } else if (event.message.text.substring(1, 9) === "filename") {
      await replyText(
        event.replyToken,
        "📁ตอนนี้ Process เป็นไฟล์ `" + PROCESS_FILE_NAME + "` งับ"
      );
    } else if (event.message.text.substring(1, 6) === "debug") {
      const [
        intervalId,
        receivers,
        totalSlots,
        idx,
        totalShift,
        nextSlotShift,
        currentTime,
        nextSlotTime,
      ] = getVar();
      const nextSlotDate = new Date(0);
      nextSlotDate.setMinutes(nextSlotTime);
      const currentDate = new Date(0);
      currentDate.setMinutes(currentTime);
      const text = `Interval: ${
        intervalId ? `Running (${intervalId})` : "Rest"
      }\nReceivers: ${receivers}\nidx: ${idx}/${totalSlots}\n+-Process: ${totalShift} min\n+-Next Slot: ${nextSlotShift} min\nCurrent Time: ${currentDate
        .toISOString()
        .substring(11, 16)}\nNext Slot: ${nextSlotDate
        .toISOString()
        .substring(11, 16)}`;
      console.log(text.split("\n").toString());
      await replyText(event.replyToken, text);
    } else if (event.message.text.substring(1, 6) === "quota") {
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
      await replyText(
        event.replyToken,
        "พิมพ์ !start เพื่อเริ่มการใช้งาน\nหรือ !stop เพื่อหยุดการใช้งาน\nส่วนคู่มือแบบเต็ม ๆ ก็อันนี้เลยยย https://docs.google.com/document/d/1rs-aK5OV9isvC4HrIy0Rb4q3cD8NZsXymxfuG3JBWhs/edit?usp=sharing"
      );
    } else {
      await replyText(event.replyToken, "ไม่เข้าใจคำสั่งอ่า ขอโทษทีน้า 😢");
    }
  }
  return;
};
export { handleEvent, initHandleEvent };
