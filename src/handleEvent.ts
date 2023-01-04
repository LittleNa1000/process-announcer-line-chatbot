import axios from "axios";
import * as dotenv from "dotenv";
import {
  addReceiver,
  removeReceiver,
  plusProcess,
  getVariables,
  getTotalReceivers,
  getSlotDetail,
} from "./announcer";
import { replyText, getSender, getGroupName, replyFlex, pushText } from "./client";
import { configs } from "./config";
import {
  readCounter,
  readPlusProcessRecords,
  readReceivers,
  writeCounter,
  writePlusProcessRecords,
} from "./file-manager/readwritejson";
import { addReceiverReplyText, helpFlex } from "./templates";
import { logger } from "./logger";
const { PROCESS_FILE_NAME, MOREDETAIL_BTN_LIMIT } = configs;
const env = dotenv.config().parsed;
const config = {
  headers: {
    Authorization: `Bearer ${
      env.NODE_ENV === "development" ? env.ACCESS_TOKEN_DEMO : env.ACCESS_TOKEN
    }`,
  },
};
async function getLogInfo(event: any) {
  const timeStamp = new Date(event.timestamp);
  const id = event.source.type === "group" ? event.source.groupId : event.source.userId;
  const sender = await getSender(
    event.source.type === "group" ? event.source.groupId : null,
    event.source.userId
  );
  const chatName = event.source.type === "group" ? await getGroupName(id) : sender;
  return [timeStamp, id, sender, chatName];
}
async function handleEvent(event) {
  if (
    event.type == "message" &&
    event.message.type === "text" &&
    event.message.text.charAt(0) === "!" &&
    event.message.text.replaceAll("!", "").trim().length > 0
  ) {
    const [timeStamp, id, sender, chatName] = await getLogInfo(event);
    let commandMessage = "Unknown Command";
    if (event.message.text.substring(1, 6) === "start") {
      commandMessage = event.message.text.substring(1);
      const result = await addReceiver(id, event.message.text.split(" ").slice(1), chatName);
      if (result !== null) await replyText(event.replyToken, addReceiverReplyText(result));
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
      const op = event.message.text.substring(1, 2);
      const arg = event.message.text.split(" ");
      commandMessage = op + arg[1] + " " + arg[2];
      try {
        const { records, blackList } = readPlusProcessRecords();
        if (blackList[event.source.userId]) throw new Error("User is banned");
        const result = await plusProcess(arg, op === "-", sender, id, chatName);
        if (result !== null) await replyText(event.replyToken, addReceiverReplyText(result));
        records.push([timeStamp.toLocaleString(), event.source.userId, sender, commandMessage]);
        writePlusProcessRecords(records, blackList);
      } catch (err) {
        commandMessage += " " + err.message;
        if (err.message === "User is banned")
          await replyText(event.replyToken, `คุณ ${sender} ถูกแบนจากการ +-โปรเซสอยู่งับ`);
        else if (err.message === "wrong argument")
          await replyText(
            event.replyToken,
            'ใส่คำสั่งบวกโปรเซสผิดงับ❌\nต้องแบบนี้น้า✔️ "!+ <minutes> <now/next/Slot No> " หรือ "!- <minutes> <now/next/Slot No> "'
          );
        else logger.error(err.stack);
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
        const nextSlotDateObject = new Date(Math.min(nextSlotTime, 23 * 60 + 59) * 60000);
        const currentDateObject = new Date(Math.min(currentTime, 23 * 60 + 59) * 60000);
        const text = `Interval: ${
          intervalId ? `Running (${intervalId})` : "Rest"
        }\nTotal Chat Rooms: ${totalChats}\nTotal Receivers: ${totalReceivers}\nidx: ${idx}/${totalSlots}\n+-Total: ${totalShift} min\n+-Next Slot: ${nextSlotShift} min\nCurrent Time: ${currentDateObject
          .toISOString()
          .substring(11, 16)}\nNext Slot: ${nextSlotDateObject.toISOString().substring(11, 16)}`;
        logger.info(text.split("\n").toString());
        await replyText(event.replyToken, text);
      } catch (err) {
        logger.error(err.stack);
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
          logger.error(`${err.config.url}, ${err.response.data.message}`);
        });
      await axios
        .get("https://api.line.me/v2/bot/message/quota/", config)
        .then((res) => {
          quota = res.data.value;
          type = res.data.type;
        })
        .catch((err) => {
          logger.error(`${err.config.url}, ${err.response.data.message}`);
        });
      const { receivers } = readReceivers();
      const totalReceivers = getTotalReceivers(receivers);
      const reply = `Usage: ${usage}/${quota} (${
        (usage * 100) / quota
      }%)\nTotal Receivers: ${totalReceivers}\nType: ${type}`;
      await replyText(event.replyToken, reply);
    } else if (event.message.text.substring(1, 5) === "help") {
      commandMessage = "help";
      await replyFlex(
        event.replyToken,
        helpFlex(),
        "พิมพ์ !start หรือ !start ตามด้วยชื่อฝ่าย (เช่น !start plan coop) เพื่อเริ่มแจ้ง Slot"
      );
    } else if (event.message.text.substring(1, 5) === "slot") {
      const slotNum = Number.parseInt(event.message.text.split(" ")[1]);
      commandMessage = "slot " + slotNum;
      try {
        await replyFlex(event.replyToken, getSlotDetail(slotNum), `Slot #${slotNum} full detail`);
      } catch (err) {
        if (err.message === "Invalid slotNum") {
          commandMessage += " " + err.message;
          await replyText(event.replyToken, `ไม่สามารถแสดงรายละเอียดของ Slot #${slotNum} ได้งับ`);
        } else logger.error(err.stack);
      }
    } else if (event.message.text.substring(1, 8) === "records") {
      commandMessage = "records";
      // Admin only command
      if (event.source.userId != env.ADMIN_UID)
        await replyText(event.replyToken, "ไม่สามารถขอ Records ได้ ขอโทดทีงับ");
      else {
        const { records } = readPlusProcessRecords();
        const unique = {};
        records.forEach((record: Array<number | string>) => {
          unique[record[1]] = record[2];
        });
        await pushText(env.ADMIN_UID, String(Object.entries(unique)));
      }
    } else if (event.message.text.substring(1, 4) === "ban") {
      const bannedId = event.message.text.split(" ")[1];
      commandMessage = "ban " + bannedId;
      // Admin only command
      if (event.source.userId != env.ADMIN_UID)
        await replyText(event.replyToken, "ไม่สามารถแบนได้ ขอโทดทีงับ");
      else {
        const { records, blackList } = readPlusProcessRecords();
        let bannedUser = "Unknown";
        records.forEach((record: object) => {
          if (record[1] === bannedId) bannedUser = record[2];
        });
        blackList[bannedId] = [timeStamp.toLocaleString(), bannedUser];
        writePlusProcessRecords(records, blackList);
        await replyText(event.replyToken, `แบน ${bannedId.substring(0, 5)}... แล้วงับ`);
      }
    } else if (event.message.text.substring(1, 6) === "unban") {
      const unbannedId = event.message.text.split(" ")[1];
      commandMessage = "unban " + unbannedId;
      // Admin only command
      if (event.source.userId != env.ADMIN_UID)
        await replyText(event.replyToken, "ไม่สามารถปลดแบนได้ ขอโทดทีงับ");
      else {
        const { records, blackList } = readPlusProcessRecords();
        delete blackList[unbannedId];
        writePlusProcessRecords(records, blackList);
        await replyText(event.replyToken, `ปลดแบน ${unbannedId.substring(0, 5)}... แล้วงับ`);
      }
    } else {
      return await replyText(event.replyToken, "ไม่เข้าใจคำสั่งอ่า ขอโทษทีน้า 😢");
    }
    logger.info(
      `${sender} ${event.source.userId} ${
        id.charAt(0) === "U" ? "(dm)" : "in " + chatName
      } ${commandMessage}`
    );
  } else if (event.type === "postback") {
    const [timeStamp, id, sender, chatName] = await getLogInfo(event);
    let postBackCommand = "Unknown";
    if (event.postback.data.substring(0, 10) === "slotDetail") {
      const slotNum = Number.parseInt(event.postback.data.split(" ")[1]);
      postBackCommand = "Postback: slot " + slotNum;
      try {
        const { counter } = readCounter();
        counter[id] = counter[id] || { chatName: chatName };
        if (counter[id][slotNum] >= MOREDETAIL_BTN_LIMIT)
          throw new Error("Exceeded maximum clicks");
        counter[id][slotNum] = counter[id][slotNum] + 1 || 1;
        writeCounter(counter);
        await replyFlex(event.replyToken, getSlotDetail(slotNum), `Slot #${slotNum} full detail`);
      } catch (err) {
        if (err.message === "Exceeded maximum clicks" || err.message === "Invalid slotNum")
          postBackCommand += " " + err.message;
        else logger.error(err.stack);
      }
    }
    logger.info(
      `${sender} ${event.source.userId} ${
        id.charAt(0) === "U" ? "(dm)" : "in " + chatName
      } ${postBackCommand}`
    );
  }
}
export { handleEvent };
