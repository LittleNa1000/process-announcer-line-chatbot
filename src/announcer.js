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
let intervalId = null;
let receiverId = [];
let slots = [];
let idx = 0;
let shift = undefined;
let totalShift = 0;

async function initAnnounce(c) {
  client = c;
  slots = await readProcess();
  shift = new Array(slots.length).fill(0);
  // console.log(slots.slice(0, 10));
}
function getVar() {
  return [
    intervalId,
    receiverId.length,
    slots.length,
    idx,
    totalShift,
    getCurrentTime(),
    getNextSlotTime(),
  ];
}
async function getName(groupId, userId) {
  let name = "Unknown";
  if (groupId !== null) {
    await client
      .getGroupMemberProfile(groupId, userId)
      .then((profile) => {
        name = profile.displayName;
      })
      .catch((err) => {
        console.log(err);
      });
  } else {
    await client
      .getProfile(userId)
      .then((profile) => {
        name = profile.displayName;
      })
      .catch((err) => {
        console.log(err);
      });
  }
  return name;
}

function getCurrentTime() {
  const currentDate = new Date();
  return currentDate.getHours() * 60 + currentDate.getMinutes();
}
function getNextSlotTime() {
  const nextSlot = slots[idx + 1][BEGIN_TIME].split(":").map((e) =>
    Number.parseInt(e)
  );
  return nextSlot[0] * 60 + nextSlot[1] + shift[idx + 1];
}
const announce = async () => {
  if (idx + 1 < slots.length) {
    const nextSlotTime = getNextSlotTime();
    const currentTime = getCurrentTime();
    if (nextSlotTime > currentTime) return;
    idx++;
    let slot = slots[idx];
    if (BEGIN_TIME !== -1 && shift[idx] !== 0) {
      slot[BEGIN_TIME] = `${slot[BEGIN_TIME]} (+${shift[idx]})`;
    }
    if (END_TIME !== -1 && shift[idx] !== 0) {
      slot[END_TIME] = `${slot[END_TIME]} (+${shift[idx]})`;
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
      NAME !== -1 ? '*"' + slot[NAME] + '"*' : ""
    }\n${LEADER !== -1 ? "⚖️ *" + slot[LEADER] + "*" : ""}\n${
      LOCATION !== -1 ? "📌 " + slot[LOCATION] : ""
    }`;
    receiverId.forEach(async (id) => {
      await client
        .pushMessage(id, {
          type: "text",
          text: text,
        })
        .catch((err) => {
          console.log(err);
        });
    });
  } else {
    clearInterval(intervalId);
    intervalId = null;
  }
};

const addReceiverId = (id) => {
  if (receiverId.indexOf(id) === -1) {
    receiverId.push(id);
  }
  if (receiverId.length == 1) {
    const currentTime = getCurrentTime();
    while (currentTime > getNextSlotTime()) {
      idx++;
      if (idx + 1 >= slots.length) {
        idx = 0;
        break;
      }
    }
    intervalId = setInterval(announce, 2000);
  }
  return idx + 1;
};

const removeReceiverId = (id) => {
  const i = receiverId.indexOf(id);
  if (i !== -1) {
    receiverId.splice(i, 1);
  }
  if (receiverId.length == 0) {
    idx = 0;
    clearInterval(intervalId);
    intervalId = null;
  }
  return;
};

const plusProcess = async (arg, isNegative, sender) => {
  let [, duration, atSlot] = arg;
  atSlot = Math.max(
    1,
    atSlot === "now" ? idx : atSlot === "next" ? idx + 1 : parseInt(atSlot)
  );
  duration = parseInt(duration);
  if (
    !(
      Number.isInteger(duration) &&
      Number.isInteger(atSlot) &&
      atSlot < slots.length &&
      idx <= atSlot &&
      duration > 0
    )
  ) {
    throw "wrong argument";
  }
  for (let i = atSlot; i < slots.length; ++i) {
    shift[i] += isNegative ? -duration : duration;
  }
  totalShift += isNegative ? -duration : duration;
  const replyText = `🚨${isNegative ? "-" : "+"}${duration} นาที ${
    totalShift === 0 ? "*Setzero*" : `รวม ${totalShift} นาที`
  } ตั้งแต่ Slot #${atSlot} น้างับ 🚨\nสั่งโดย *${sender}*`;
  receiverId.forEach(async (id) => {
    await client
      .pushMessage(id, {
        type: "text",
        text: replyText,
      })
      .catch((err) => {
        console.log(err);
      });
  });
  return;
};

module.exports = {
  initAnnounce,
  addReceiverId,
  removeReceiverId,
  plusProcess,
  getName,
  getVar,
};
