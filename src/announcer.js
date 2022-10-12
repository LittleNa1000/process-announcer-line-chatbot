const { readProcess } = require("./utils/readcsv");
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
const { pushText } = require("./client");
let intervalId = null;
let receiverId = [];
let slots = [];
let idx = 0;
let shift = undefined;
let totalShift = 0;

async function initAnnouncer() {
  slots = await readProcess();
  shift = new Array(slots.length).fill(0);
  if (intervalId !== null) {
    clearInterval(intervalId);
  }
  resetIdx();
  intervalId = setInterval(announce, 2000);
}
function resetIdx() {
  const currentTime = getCurrentTime();
  let minIdx = 0;
  let minTime = 99 * 60 + 59;
  let nextSlotTime = 0;
  idx = 0;
  while (idx < slots.length - 1) {
    nextSlotTime = getNextSlotTime();
    if (currentTime < nextSlotTime) {
      if (nextSlotTime < minTime) {
        minTime = nextSlotTime;
        minIdx = idx;
      }
    }
    idx++;
  }
  idx = minIdx;
}
function getVar() {
  return [
    intervalId,
    receiverId.length,
    slots.length,
    idx,
    totalShift,
    idx < slots.length - 1 ? shift[idx + 1] : null,
    getCurrentTime(),
    getNextSlotTime(),
  ];
}

function getCurrentTime() {
  const currentDate = new Date();
  return currentDate.getHours() * 60 + currentDate.getMinutes();
}
function getNextSlotTime(index = idx) {
  if (index >= slots.length - 1) {
    return 99 * 60 + 59;
  }
  const nextSlot = slots[index + 1][BEGIN_TIME].split(":").map((e) =>
    Number.parseInt(e)
  );
  return (nextSlot[0] * 60 + nextSlot[1] + shift[index + 1]) % (24 * 60);
}
const announce = async () => {
  if (idx < slots.length - 1) {
    const nextSlotTime = getNextSlotTime();
    const currentTime = getCurrentTime();
    if (
      nextSlotTime > currentTime ||
      (idx == 0 && nextSlotTime !== currentTime)
    )
      return;
    idx++;
    let slot = slots[idx];
    if (BEGIN_TIME !== -1 && shift[idx] !== 0) {
      slot[BEGIN_TIME] += ` (${shift[idx] >= 0 ? "+" : ""}${shift[idx]})`;
    }
    if (END_TIME !== -1 && shift[idx] !== 0) {
      slot[END_TIME] += ` (${shift[idx] >= 0 ? "+" : ""}${shift[idx]})`;
    }
    slot[LOCATION] = slot[LOCATION].split("\n");
    slot[MEMBER] = slot[MEMBER].split("\n");
    slot[DETAILS] = slot[DETAILS].split("\n");
    const text = `${NUM !== -1 ? "#" + slot[NUM] : ""} ${
      BEGIN_TIME !== -1 &&
      END_TIME !== -1 &&
      slot[BEGIN_TIME] !== slot[END_TIME]
        ? "⏱️ `" + slot[BEGIN_TIME] + " - " + slot[END_TIME] + "`"
        : BEGIN_TIME !== -1
        ? "🔔 `" + slot[BEGIN_TIME] + "`"
        : ""
    }\n${OWNER !== -1 ? "📋 " + slot[OWNER] : ""} ${
      NAME !== -1 ? '"' + slot[NAME] + '"' : ""
    }\n${LEADER !== -1 ? "⚖️ " + slot[LEADER] : ""}\n${
      LOCATION !== -1
        ? "📌 " +
          slot[LOCATION][0] +
          " และอีก " +
          (slot[LOCATION].length - 1) +
          " ที่"
        : ""
    }\n${MEMBER !== -1 ? "👪 " + slot[MEMBER][0] : ""}\n${
      DETAILS !== -1 ? "📃 " + slot[DETAILS][0] : ""
    }`;
    receiverId.forEach(async (id) => {
      await pushText(id, text);
    });
  } else {
    resetIdx();
  }
};

const addReceiverId = (id) => {
  const currentTime = getCurrentTime();
  if (receiverId.indexOf(id) === -1) {
    receiverId.push(id);
  }
  if (
    idx === 0 &&
    (getNextSlotTime(slots.length - 2) < currentTime ||
      currentTime + 90 < getNextSlotTime())
  ) {
    return null;
  }
  return [
    idx + 1,
    `${slots[idx + 1][BEGIN_TIME]} ${
      shift[idx + 1] !== 0
        ? `(${shift[idx + 1] >= 0 ? "+" : ""}${shift[idx + 1]})`
        : ""
    }`,
  ];
};

const removeReceiverId = (id) => {
  const i = receiverId.indexOf(id);
  if (i !== -1) {
    receiverId.splice(i, 1);
  }
  return;
};

const plusProcess = async (arg, isNegative, sender, id) => {
  let [, duration, atSlot] = arg;
  let newReceiverIdx = undefined;
  atSlot = Math.max(
    1,
    atSlot === "now" ? idx : atSlot === "next" ? idx + 1 : parseInt(atSlot)
  );
  duration = isNegative ? parseInt(-duration) : parseInt(duration);
  if (
    !(
      Number.isInteger(duration) &&
      Number.isInteger(atSlot) &&
      atSlot < slots.length &&
      duration !== 0
    )
  ) {
    throw "wrong argument";
  }

  for (let i = atSlot; i < slots.length; ++i) {
    shift[i] += duration;
  }
  totalShift += duration;
  if (receiverId.indexOf(id) === -1) {
    newReceiverIdx = addReceiverId(id);
  }
  const text = `🚨${duration < 0 ? "" : "+"}${duration} นาที ${
    totalShift === 0 ? "*Setzero*" : `รวม ${totalShift} นาที`
  } ตั้งแต่ Slot #${atSlot} น้างับ 🚨\n⌛Slot #${atSlot} เริ่ม ${
    slots[idx + 1][BEGIN_TIME]
  } ${
    shift[idx + 1] !== 0
      ? `(${shift[idx + 1] >= 0 ? "+" : ""}${shift[idx + 1]})`
      : ""
  }\nสั่งโดย ${sender}`;
  receiverId.forEach(async (id) => {
    await pushText(id, text);
  });
  return newReceiverIdx;
};

module.exports = {
  initAnnouncer,
  addReceiverId,
  removeReceiverId,
  plusProcess,
  getVar,
};
