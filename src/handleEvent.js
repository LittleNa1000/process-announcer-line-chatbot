const { addReceiverId, removeReceiverId } = require("./announce");

let client = null;

function initHandleEvent(c) {
  client = c;
}

const handleEvent = async (event) => {
  console.log(event);
  if (event.message.type === "text" && event.message.text.charAt(0) === "!") {
    if (event.message.text.substring(1, 6) === "start") {
      const id =
        event.source.type === "group"
          ? event.source.groupId
          : event.source.userId;
      const receiverId = addReceiverId(id);
      return client
        .replyMessage(event.replyToken, {
          type: "text",
          text: `${receiverId.toString()}`,
        })
        .catch((err) => {
          console.log(err);
        });
    } else if (event.message.text.substring(1, 5) === "stop") {
      const id =
        event.source.type === "group"
          ? event.source.groupId
          : event.source.userId;
      const receiverId = removeReceiverId(id);
      return client
        .replyMessage(event.replyToken, {
          type: "text",
          text: `${receiverId.toString()}`,
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      return client.replyMessage(event.replyToken, {
        type: "text",
        text: "ไม่เข้าใจคำสั่งอ่า ขอโทษทีน้า TT",
      });
    }
  } else {
    return;
  }
};
module.exports = { handleEvent, initHandleEvent };
