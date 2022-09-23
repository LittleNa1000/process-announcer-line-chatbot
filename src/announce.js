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
let shift = 0;
let from = 0;

async function initAnnounce(c) {
  client = c;
  slots = await readProcess();
  // console.log(slots.slice(0, 10));
}

const announce = async () => {
  if (idx < slots.length) {
    const slot = slots[idx];
    const text = `${NUM !== -1 ? "#" + slot[NUM] : ""} ${
      BEGIN_TIME !== -1 &&
      END_TIME !== -1 &&
      slot[BEGIN_TIME] !== slot[END_TIME]
        ? "⏱️ `" + slot[BEGIN_TIME] + "` - `" + slot[END_TIME] + "`"
        : BEGIN_TIME !== -1
        ? "🔔 `" + slot[BEGIN_TIME] + "`"
        : ""
    }\n${OWNER !== -1 ? "💬 " + slot[OWNER] : ""} ${
      NAME !== -1 ? '*"' + slot[NAME] + '"*' : ""
    }\n${LEADER !== -1 ? "👑 *" + slot[LEADER] + "*" : ""}\n${
      LOCATION !== -1 ? "📌 " + slot[LOCATION] : ""
    }`;
    if (false) {
    }
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

const plusProcess = (arg, isNegative) => {
  let [, duration, addSlot] = arg;
  addSlot =
    addSlot === "now"
      ? 0
      : addSlot === "next"
      ? 1
      : Math.max(0, parseInt(addSlot));
  duration = parseInt(duration);
  if (
    !(
      Number.isInteger(duration) &&
      Number.isInteger(addSlot) &&
      idx + addSlot < slots.length &&
      duration > 0
    )
  ) {
    throw "wrong argument";
  }
  shift = Math.max(0, isNegative ? shift - duration : shift + duration);
  from = idx + addSlot;
  return [duration, shift, from];
};

module.exports = { initAnnounce, addReceiverId, removeReceiverId, plusProcess };
