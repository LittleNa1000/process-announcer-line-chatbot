const message = {
  type: "text",
  text: "Hello World!",
};
let client = null;
let receiverId = [];

function initAnnounce(c) {
  client = c;
}

const announce = async () => {
  await client.pushMessage(receiverId[0], [message]).catch((err) => {
    console.log(err);
  });
  return;
};
const addReceiverId = async (id) => {
  if (receiverId.indexOf(id) === -1) {
    receiverId.push(id);
  }
  if (receiverId.length > 0) {
    await announce();
  }
  return receiverId;
};
const removeReceiverId = (id) => {
  const idx = receiverId.indexOf(id);
  if (idx !== -1) {
    receiverId.splice(idx, 1);
  }
  if (receiverId.length === 0) {
    return ["empty"];
  }
  return receiverId;
};
module.exports = { initAnnounce, addReceiverId, removeReceiverId };
