const {
  addReceiverId,
  removeReceiverId,
  plusProcess,
  getName,
  getVar,
} = require("./announcer");
const { PROCESS_FILE_NAME, LEADER } = require("./constants");

let client = null;

function initHandleEvent(c) {
  client = c;
}

const handleEvent = async (event) => {
  if (
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
      return client
        .replyMessage(event.replyToken, {
          type: "text",
          text:
            idx === null
              ? `ตอนนี้เลยเวลา Slot สุดท้ายของ Process ในวันนี้แล้ว ไว้เรียกเราในวันอื่นน้า😉`
              : `เริ่มประกาศตั้งแต่ Slot #${idx} น้า😉`,
        })
        .catch((err) => {
          console.log(err);
        });
    } else if (event.message.text.substring(1, 5) === "stop") {
      removeReceiverId(id);
      return;
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
        return newReceiverIdx !== undefined
          ? client
              .replyMessage(event.replyToken, {
                type: "text",
                text:
                  newReceiverIdx === null
                    ? `ตอนนี้เลยเวลา Slot สุดท้ายของ Process ในวันนี้แล้ว ไว้เรียกเราในวันอื่นน้า😉`
                    : `เริ่มประกาศตั้งแต่ Slot #${newReceiverIdx} น้า😉`,
              })
              .catch((err) => {
                console.log(err);
              })
          : null;
      } catch (err) {
        return client
          .replyMessage(event.replyToken, {
            type: "text",
            text: "ใส่คำสั่งบวกโปรเซสผิดงับ❌\nต้องแบบนี้น้า✔️ ```!+ (นาที) (Slot) หรือ !- (นาที) (Slot)```",
          })
          .catch((err) => {
            console.log(err);
          });
      }
    } else if (event.message.text.substring(1, 9) === "filename") {
      return client
        .replyMessage(event.replyToken, {
          type: "text",
          text: "📁ตอนนี้ Process เป็นไฟล์ `" + PROCESS_FILE_NAME + "` งับ",
        })
        .catch((err) => {
          console.log(err);
        });
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
      const replyText = `Interval: ${
        intervalId ? `Running (${intervalId})` : "Rest"
      }\nReceivers: ${receivers}\nidx: ${idx}/${totalSlots}\n+-Process: ${totalShift} min\n+-Next Slot: ${nextSlotShift} min\nCurrent Time: ${Math.floor(
        currentTime / 60
      )}:${currentTime % 60}\nNext Slot: ${Math.floor(nextSlotTime / 60)}:${
        nextSlotTime % 60
      }`;
      console.log(replyText.split("\n").toString());
      return client
        .replyMessage(event.replyToken, {
          type: "text",
          text: replyText,
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      return client.replyMessage(event.replyToken, {
        type: "text",
        text: "ไม่เข้าใจคำสั่งอ่า ขอโทษทีน้า 😢",
      });
    }
  }
  return;
};
module.exports = { handleEvent, initHandleEvent };
