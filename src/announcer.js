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
const { readJSON, writeJSON } = require("./utils/readwritejson");
let intervalId = null;
let slots = [];
let bundle = [];
let slotOwner = [];
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
  intervalId = setInterval(announce, 5 * 1000);
}
function resetIdx() {
  const currentTime = getCurrentTime();
  let nextSlotTime = 0;
  let minIdx = 0;
  let minTime = 99 * 60 + 59;
  for (let i = 0; i < slots.length - 1; ++i) {
    nextSlotTime = getNextSlotTime(i);
    if (currentTime < nextSlotTime) {
      if (nextSlotTime < minTime) {
        minTime = nextSlotTime;
        minIdx = i;
      }
    }
  }
  idx = minIdx;
}
function getVar() {
  return [
    intervalId,
    readJSON().receivers.length,
    slots.length - 1,
    idx,
    totalShift,
    idx < slots.length - 1 ? shift[idx + 1] : "N/A",
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
    return (23 + 24) * 60 + 59;
  }
  const nextSlot = slots[index + 1][BEGIN_TIME].split(":").map((e) =>
    Number.parseInt(e)
  );
  return (nextSlot[0] * 60 + nextSlot[1] + shift[index + 1]) % (24 * 60);
}
const announce = async () => {
  if (idx < slots.length - 1) {
    let nextSlotTime = getNextSlotTime();
    let currentTime = getCurrentTime();
    while (
      !(
        nextSlotTime > currentTime ||
        (idx == 0 && nextSlotTime !== currentTime)
      )
    ) {
      if (bundle.length >= 5) {
        setTimeout(announce, 0.5 * 1000);
        break;
      }
      idx++;
      nextSlotTime = getNextSlotTime();
      currentTime = getCurrentTime();
      let slot = [...slots[idx]];
      if (BEGIN_TIME !== -1 && shift[idx] !== 0) {
        slot[BEGIN_TIME] += ` (${shift[idx] >= 0 ? "+" : ""}${shift[idx]})`;
      }
      if (END_TIME !== -1 && shift[idx] !== 0) {
        slot[END_TIME] += ` (${shift[idx] >= 0 ? "+" : ""}${shift[idx]})`;
      }
      if (LOCATION !== -1) {
        slot[LOCATION] = slot[LOCATION].split("\n");
        slot[LOCATION] = `${slot[LOCATION][0]}${
          slot[LOCATION].length > 1
            ? " และอื่น ๆ อีก " + (slot[LOCATION].length - 1) + " ที่"
            : ""
        }`;
      }
      if (MEMBER !== -1) {
        slot[MEMBER] = slot[MEMBER].split("\n");
        slot[MEMBER] = `${slot[MEMBER][0]}${
          slot[MEMBER].length > 1
            ? " กับคนอื่น ๆ อีก " + (slot[MEMBER].length - 1) + " คน"
            : ""
        }`;
      }
      if (DETAILS !== -1) {
        slot[DETAILS] = slot[DETAILS].split("\n");
        slot[DETAILS] = `${slot[DETAILS][0]}${
          slot[DETAILS].length > 1 ? "..." : ""
        }`;
      }
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
        LOCATION !== -1 ? "📌 " + slot[LOCATION] : ""
      }\n${MEMBER !== -1 ? "🏃 " + slot[MEMBER] : ""}\n${
        DETAILS !== -1 ? "📃 " + slot[DETAILS] : ""
      }`;
      bundle.push(text);
      slotOwner.push(OWNER !== -1 ? slot[OWNER].toUpperCase() : "");
    }
    if (bundle.length > 0) {
      const { receivers } = readJSON();
      receivers.forEach(async (e) => {
        let prefBundle = [];
        if (Object.keys(e.preferences).length === 0 || OWNER === -1) {
          prefBundle = bundle;
        } else {
          for (let i = 0; i < bundle.length; ++i) {
            if (e.preferences[slotOwner[i]]) {
              prefBundle.push(bundle[i]);
            }
          }
        }
        await pushText(e.id, prefBundle);
      });
    }
    bundle = [];
    slotOwner = [];
    if (idx >= slots.length - 1) {
      resetIdx();
    }
  } else {
    resetIdx();
  }
};

const addReceiverId = (id, arg, name) => {
  const currentTime = getCurrentTime();
  const { receivers } = readJSON();
  let i = receivers.map((e) => e.id).indexOf(id);
  if (i === -1) {
    receivers.push({ id: id, name: name, preferences: {} });
    i = 0;
  } else if (arg === null) {
    return null;
  }
  if (arg !== null) {
    receivers[i].preferences = {};
    arg.forEach((e) => {
      if (e.toUpperCase() === "COOR") {
        e = "COOP";
      }
      receivers[i].preferences[e.toUpperCase()] = true;
    });
  }
  writeJSON(receivers);
  if (
    idx >= slots.length - 1 ||
    (idx === 0 && getNextSlotTime(slots.length - 2) < currentTime)
  ) {
    return -1;
  }
  return [
    idx + 1,
    `${slots[idx + 1][BEGIN_TIME]}${
      shift[idx + 1] !== 0
        ? `(${shift[idx + 1] >= 0 ? "+" : ""}${shift[idx + 1]})`
        : ""
    }`,
  ];
};

const removeReceiverId = (id) => {
  const { receivers } = readJSON();
  const i = receivers.map((e) => e.id).indexOf(id);
  if (i !== -1) {
    receivers.splice(i, 1);
    writeJSON(receivers);
    return true;
  }
  return false;
};

const plusProcess = async (arg, isNegative, sender, id, name) => {
  let [, duration, atSlot] = arg;
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
  const result = addReceiverId(id, null, name);
  const text = `🚨${duration < 0 ? "" : "+"}${duration} นาที ${
    totalShift === 0 ? "*Setzero*" : `รวม ${totalShift} นาที`
  } ตั้งแต่ Slot #${atSlot} น้างับ 🚨\n⌛Slot #${atSlot} ${
    atSlot === idx
      ? `จบ ${slots[atSlot][END_TIME]}`
      : `เริ่ม ${slots[atSlot][BEGIN_TIME]} `
  } ${
    shift[atSlot] !== 0
      ? `(${shift[atSlot] >= 0 ? "+" : ""}${shift[atSlot]})`
      : ""
  }\nสั่งโดย ${sender}`;
  const { receivers } = readJSON();
  receivers.forEach(async (e) => {
    await pushText(e.id, text);
  });
  setTimeout(announce, 0.5 * 1000);
  return result;
};

module.exports = {
  initAnnouncer,
  addReceiverId,
  removeReceiverId,
  plusProcess,
  getVar,
};
