const handleEvent = async (event, client) => {
  console.log(event);
  return client.replyMessage(event.replyToken, { type: "text", text: "Test" });
};
module.exports = { handleEvent };
