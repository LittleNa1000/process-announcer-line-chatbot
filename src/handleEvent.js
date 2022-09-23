const { addReceiverId, removeReceiverId, plusProcess } = require("./announce");

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
    console.log(timeStamp.toLocaleString(), event.message.text, event.source);
    if (event.message.text.substring(1, 6) === "start") {
      const id =
        event.source.type === "group"
          ? event.source.groupId
          : event.source.userId;
      const idx = addReceiverId(id);
      return client
        .replyMessage(event.replyToken, {
          type: "text",
          text: `เริ่มประกาศตั้งแต่ Slot #${idx} น้า`,
        })
        .catch((err) => {
          console.log(err);
        });
    } else if (event.message.text.substring(1, 5) === "stop") {
      const id =
        event.source.type === "group"
          ? event.source.groupId
          : event.source.userId;
      removeReceiverId(id);
      return;
    } else if (
      event.message.text.substring(1, 2) === "+" ||
      event.message.text.substring(1, 2) === "-"
    ) {
      try {
        const op = event.message.text.substring(1, 2);
        const [duration, shift, from] = await plusProcess(
          event.message.text.split(" "),
          op === "-" ? true : false,
          event.source.type === "group" ? event.source.groupId : null,
          event.source.userId
        );
        return;
      } catch (err) {
        return client
          .replyMessage(event.replyToken, {
            type: "text",
            text: "ใส่คำสั่งบวกลบโปรเซสผิดงับ\nต้องแบบนี้น้า !+ (จำนวนนาที) (จำนวน slot ที่จะบวก)",
          })
          .catch((err) => {
            console.log(err);
          });
      }
    } else {
      return client.replyMessage(event.replyToken, {
        type: "text",
        text: "ไม่เข้าใจคำสั่งอ่า ขอโทษทีน้า 😢",
      });
    }
  } else {
    return;
  }
};
module.exports = { handleEvent, initHandleEvent };
