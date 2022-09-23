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
const addReceiverId = (id) => {
  receiverId.push(id);
  announce();
};
module.exports = { addReceiverId, initAnnounce };
