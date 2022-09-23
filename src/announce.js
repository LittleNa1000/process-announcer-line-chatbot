const { readProcess } = require("./readcsv");
const {
  NUM,
  BEGIN_TIME,
  END_TIME,
  DURATION,
  OWNER,
  NAME,
  LOCATION,
  LEADER,
  MEMBER,
  DETAILS,
} = require("./constants");

let client = null;
let timeoutId = null;
let receiverId = [];
let slots = [];
let idx = 1;

async function initAnnounce(c) {
  client = c;
  slots = await readProcess();
}

const announce = async () => {
  if (idx < slots.length) {
    const slot = slots[idx];
    const text = `${slot[NUM]} ${slot[BEGIN_TIME]}-${slot[END_TIME]}\n${slot[OWNER]} ${slot[NAME]}`;
    const message = {
      type: "text",
      text: text,
    };
    receiverId.forEach(async (id) => {
      await client.pushMessage(id, message).catch((err) => {
        console.log(err);
      });
    });
    idx++;
  }
  timeoutId = setTimeout(announce, 4000);
};

const addReceiverId = (id) => {
  if (receiverId.indexOf(id) === -1) {
    receiverId.push(id);
  }
  if (receiverId.length === 1) {
    timeoutId = setTimeout(announce, 4000);
  }
  return receiverId;
};

const removeReceiverId = (id) => {
  const idx = receiverId.indexOf(id);
  if (idx !== -1) {
    receiverId.splice(idx, 1);
  }
  if (receiverId.length === 0) {
    clearTimeout(timeoutId);
    return ["empty"];
  }
  return receiverId;
};

module.exports = { initAnnounce, addReceiverId, removeReceiverId };
