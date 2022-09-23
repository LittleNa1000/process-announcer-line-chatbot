const { addReceiverId } = require("./announce");

let client = null;

function initHandleEvent(c) {
  client = c;
}

const handleEvent = async (event) => {
  console.log(event);
  const id =
    event.source.type === "group" ? event.source.groupId : event.source.userId;
  addReceiverId(id);
  return client.replyMessage(event.replyToken, { type: "text", text: "Test" });
};
module.exports = { handleEvent, initHandleEvent };
