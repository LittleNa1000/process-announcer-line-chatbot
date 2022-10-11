const axios = require("axios");
const {
  addReceiverId,
  removeReceiverId,
  plusProcess,
  getName,
  getVar,
} = require("./announcer");
const { PROCESS_FILE_NAME } = require("./constants");
const dotenv = require("dotenv");

let client = null;
const env = dotenv.config().parsed;
const config = {
  headers: { Authorization: `Bearer ${env.ACCESS_TOKEN_DEMO}` },
};

function initHandleEvent(c) {
  client = c;
}
async function replyText(replyToken, text) {
  await client
    .replyMessage(replyToken, {
      type: "text",
      text: text,
    })
    .catch((err) => {
      console.log(err);
    });
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
    const sender = await getName(
      event.source.type === "group" ? event.source.groupId : null,
      event.source.userId
    );
    console.log(timeStamp.toLocaleString(), sender, event.message.text);
    if (event.message.text.substring(1, 6) === "start") {
      const idx = addReceiverId(id);
      await replyText(
        event.replyToken,
        idx === null
          ? `ตอนนี้เลยเวลา Slot สุดท้ายของ Process ในวันนี้แล้ว ไว้เรียกเราในวันอื่นน้า😉`
          : `เริ่มประกาศตั้งแต่ Slot #${idx} น้า😉`
      );
    } else if (event.message.text.substring(1, 5) === "stop") {
      removeReceiverId(id);
    } else if (
      event.message.text.substring(1, 2) === "+" ||
      event.message.text.substring(1, 2) === "-"
    ) {
      try {
        const op = event.message.text.substring(1, 2);
        const newReceiverIdx = await plusProcess(
          event.message.text.split(" "),
          op === "-" ? true : false,
          sender,
          id
        );
        if (newReceiverIdx !== undefined) {
          await replyText(
            event.replyToken,
            newReceiverIdx === null
              ? `ตอนนี้เลยเวลา Slot สุดท้ายของ Process ในวันนี้แล้ว ไว้เรียกเราในวันอื่นน้า😉`
              : `เริ่มประกาศตั้งแต่ Slot #${newReceiverIdx} น้า😉`
          );
        }
      } catch (err) {
        await replyText(
          event.replyToken,
          "ใส่คำสั่งบวกโปรเซสผิดงับ❌\nต้องแบบนี้น้า✔️ ```!+ (นาที) (Slot) หรือ !- (นาที) (Slot)```"
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
      const text = `Interval: ${
        intervalId ? `Running (${intervalId})` : "Rest"
      }\nReceivers: ${receivers}\nidx: ${idx}/${totalSlots}\n+-Process: ${totalShift} min\n+-Next Slot: ${nextSlotShift} min\nCurrent Time: ${Math.floor(
        currentTime / 60
      )}:${currentTime % 60}\nNext Slot: ${Math.floor(nextSlotTime / 60)}:${
        nextSlotTime % 60
      }`;
      console.log(replyText.split("\n").toString());
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
    } else {
      await replyText(event.replyToken, "ไม่เข้าใจคำสั่งอ่า ขอโทษทีน้า 😢");
    }
  }
  return;
};
module.exports = { handleEvent, initHandleEvent };
