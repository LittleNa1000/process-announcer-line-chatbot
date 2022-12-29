import axios from "axios";
import * as dotenv from "dotenv";
import {
  addReceiver,
  removeReceiver,
  plusProcess,
  getVariables,
  getTotalReceivers,
} from "./announcer";
import { replyText, getSender, getGroupName, replyFlex } from "./client";
import { constants } from "./constants";
import { readReceivers } from "./file-manager/readwritejson";
import { addReceiverReplyText, helpFlex } from "./templates";
const { PROCESS_FILE_NAME } = constants;
const env = dotenv.config().parsed;
const config = {
  headers: {
    Authorization: `Bearer ${
      env.NODE_ENV === "development" ? env.ACCESS_TOKEN_DEMO : env.ACCESS_TOKEN
    }`,
  },
};

async function handleEvent(event) {
  if (
    event.type == "message" &&
    event.message.type === "text" &&
    event.message.text.charAt(0) === "!" &&
    event.message.text.replaceAll("!", "").trim().length > 0
  ) {
    const timeStamp = new Date(event.timestamp);
    const id = event.source.type === "group" ? event.source.groupId : event.source.userId;
    const sender = await getSender(
      event.source.type === "group" ? event.source.groupId : null,
      event.source.userId
    );
    const chatName = event.source.type === "group" ? await getGroupName(id) : sender;
    let commandMessage = "Unknown Command";
    if (event.message.text.substring(1, 6) === "start") {
      commandMessage = event.message.text.substring(1);
      const result = await addReceiver(id, event.message.text.split(" ").slice(1), chatName);
      if (result !== null) {
        await replyText(event.replyToken, addReceiverReplyText(result));
      }
    } else if (event.message.text.substring(1, 5) === "stop") {
      commandMessage = "stop";
      const success = removeReceiver(id);
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
        const result = await plusProcess(arg, op === "-" ? true : false, sender, id, chatName);
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
      try {
        const [
          intervalId,
          totalChats,
          totalReceivers,
          totalSlots,
          idx,
          totalShift,
          nextSlotShift,
          currentTime,
          nextSlotTime,
        ] = getVariables();
        const nextSlotDate = new Date(0);
        nextSlotDate.setMinutes(Math.min(nextSlotTime, 23 * 60 + 59));
        const currentDate = new Date(0);
        currentDate.setMinutes(Math.min(currentTime, 23 * 60 + 59));
        const text = `Interval: ${
          intervalId ? `Running (${intervalId})` : "Rest"
        }\nTotal Chat Rooms: ${totalChats}\nTotal Receivers: ${totalReceivers}\nidx: ${idx}/${totalSlots}\n+-Total: ${totalShift} min\n+-Next Slot: ${nextSlotShift} min\nCurrent Time: ${currentDate
          .toISOString()
          .substring(11, 16)}\nNext Slot: ${nextSlotDate.toISOString().substring(11, 16)}`;
        console.log(text.split("\n").toString());
        await replyText(event.replyToken, text);
      } catch (err) {
        console.log(err);
        await replyText(event.replyToken, "!debug มีปัญหางับ มาเช็กด่วน ๆ");
      }
    } else if (event.message.text.substring(1, 6) === "quota") {
      commandMessage = "quota";
      let usage = 0,
        quota = 1,
        type = "Unknown";
      await axios
        .get("https://api.line.me/v2/bot/message/quota/consumption", config)
        .then((res) => {
          usage = res.data.totalUsage;
        })
        .catch((err) => {
          console.log(err);
        });
      await axios
        .get("https://api.line.me/v2/bot/message/quota/", config)
        .then((res) => {
          quota = res.data.value;
          type = res.data.type;
        })
        .catch((err) => {
          console.log(err);
        });
      const { receivers } = readReceivers();
      const totalReceivers = getTotalReceivers(receivers);
      const text = `Usage: ${usage}/${quota} (${
        (usage * 100) / quota
      }%)\nTotal Receivers: ${totalReceivers}\nType: ${type}`;
      await replyText(event.replyToken, text);
    } else if (event.message.text.substring(1, 5) === "help") {
      commandMessage = "help";
      await replyFlex(event.replyToken, helpFlex());
    } else {
      await replyText(event.replyToken, "ไม่เข้าใจคำสั่งอ่า ขอโทษทีน้า 😢");
      return;
    }
    console.log(
      timeStamp.toLocaleString(),
      sender,
      event.source.userId,
      id.charAt(0) === "U" ? "(dm)" : "in " + chatName,
      commandMessage
    );
  } else if (event.type === "postback") {
    console.log(event);
  }
  return;
}
export { handleEvent };
