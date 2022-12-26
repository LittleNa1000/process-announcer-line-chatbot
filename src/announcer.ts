import { readProcess } from "./file-manager/readcsv";
import { constants } from "./constants";
const { BEGIN_TIME, END_TIME, OWNER, PUSH_MESSAGE_TYPE } = constants;
import { pushText, countGroupMembers, pushFlex } from "./client";
import {
  readReceivers,
  writeBackupShift,
  writeReceivers,
  readBackupShift,
} from "./file-manager/readwritejson";
import {
  generatePlusProcessFlex,
  generatePlusProcessText,
  generateSlotInfoText,
} from "./templates";
let intervalId = null;
let startDate = null;
let slots: any;
let idx = 0;
let shift = undefined;
let slotsBeginTime = undefined;
let totalShift = 0;

async function initAnnouncer() {
  if (intervalId !== null) clearInterval(intervalId);
  slots = await readProcess();
  slotsBeginTime = new Array(slots.length + 10).fill(0);
  let dateDiff = 0;
  let temp = new Array(slots.length + 10).fill(0);
  for (let i = 1; i < slots.length; ++i) {
    const slotTime = slots[i][BEGIN_TIME].split(":").map((e) => Number.parseInt(e));
    temp[i] = slotTime[0] * 60 + slotTime[1];
    if (temp[i] < temp[i - 1]) {
      ++dateDiff;
    }
    slotsBeginTime[i] = temp[i] + dateDiff * 60 * 24;
  }
  shift = new Array(slots.length + 10).fill(0);
  const { backupShift } = readBackupShift();
  let minLength = Math.min(slots.length, backupShift.length);
  for (let i = 1; i < minLength; ++i) {
    shift[i] += backupShift[i];
    slotsBeginTime[i] += backupShift[i];
  }
  totalShift = shift[slots.length - 1];
  startDate = new Date(new Date().toDateString());
  idx = resetIdx();
  intervalId = setInterval(announce, 5 * 1000);
}
function resetIdx() {
  const currentTime = getCurrentTime();
  let nextSlotTime = 0;
  let minIdx = 0;
  let minTime = Number.POSITIVE_INFINITY;
  for (let i = 0; i < slots.length - 1; ++i) {
    nextSlotTime = getNextSlotTime(i);
    if (currentTime <= nextSlotTime) {
      if (nextSlotTime < minTime) {
        minTime = nextSlotTime;
        minIdx = i;
      }
    }
  }
  return minIdx;
}
function getTotalReceivers(receivers: Array<any>) {
  return receivers.reduce((totalReceivers: number, { members }) => {
    return totalReceivers + (Number.isInteger(members) ? members : 0);
  }, 0);
}
function getVariables() {
  const { receivers } = readReceivers();
  try {
    return [
      intervalId,
      receivers.length,
      getTotalReceivers(receivers),
      slots.length - 1,
      idx,
      totalShift,
      idx < slots.length - 1 ? shift[idx + 1] : "N/A",
      getCurrentTime(),
      getNextSlotTime(),
    ];
  } catch (err) {
    console.log("getVariables() Error:", err);
  }
  return [];
}
function getCurrentTime() {
  const currentTime = new Date();
  const currentDate = new Date(currentTime.toDateString());
  const dateDiff = (currentDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24);
  return currentTime.getHours() * 60 + currentTime.getMinutes() + 60 * 24 * dateDiff;
}
function getNextSlotTime(index = idx) {
  if (index >= slots.length - 1) {
    return Number.POSITIVE_INFINITY;
  }
  return slotsBeginTime[index + 1];
}
const announce = async () => {
  if (idx < slots.length - 1) {
    let bundle = [];
    let slotOwner = [];
    let nextSlotTime = getNextSlotTime();
    let currentTime = getCurrentTime();
    while (nextSlotTime === currentTime || (nextSlotTime <= currentTime && idx !== 0)) {
      if (bundle.length >= 5) {
        setTimeout(announce, 0.5 * 1000);
        break;
      }
      idx++;
      nextSlotTime = getNextSlotTime();
      currentTime = getCurrentTime();
      let slot = [...slots[idx]];
      bundle.push(generateSlotInfoText(slot, shift[idx]));
      slotOwner.push(OWNER !== -1 ? slot[OWNER].toUpperCase() : "");
    }
    if (bundle.length > 0) {
      const { receivers } = readReceivers();
      receivers.forEach(async (receiver: any) => {
        let prefBundle = [];
        let isMatch = false;
        if (receiver.preferences.length === 0 || OWNER === -1) {
          prefBundle = bundle;
        } else {
          for (let i = 0; i < bundle.length; ++i) {
            isMatch = false;
            receiver.preferences.forEach((pref: string) => {
              if (slotOwner[i].replace("COOR", "COOP").match(pref)) isMatch = true;
            });
            if (isMatch) prefBundle.push(bundle[i]);
          }
        }
        await pushText(receiver.id, prefBundle);
      });
    }
    bundle = [];
    slotOwner = [];
  } else {
    idx = 0;
  }
};

const addReceiverId = async (id: string, arg: Array<string>, chatName: string) => {
  const currentTime = getCurrentTime();
  const { receivers } = readReceivers();
  let i = receivers.map((e) => e.id).indexOf(id);
  if (i === -1) {
    const members = id.charAt(0) === "C" ? await countGroupMembers(id) : 1;
    receivers.push({
      id: id,
      chatName: chatName,
      members: members,
      preferences: [],
    });
    i = receivers.length - 1;
  } else if (arg === null) {
    return null;
  }
  if (arg !== null) {
    receivers[i].preferences = [];
    arg.forEach((e) => {
      if (e.toUpperCase() === "COOR") e = "COOP";
      if (e.length !== 0) receivers[i].preferences.push(e.toUpperCase());
    });
  }
  writeReceivers(receivers);
  if (idx >= slots.length - 1 || (idx === 0 && getNextSlotTime(slots.length - 2) < currentTime)) {
    return -1;
  }
  return [
    idx + 1,
    `${slots[idx + 1][BEGIN_TIME]}${
      shift[idx + 1] !== 0 ? `(${shift[idx + 1] >= 0 ? "+" : ""}${shift[idx + 1]})` : ""
    }`,
  ];
};

const removeReceiverId = (id: string) => {
  const { receivers } = readReceivers();
  const i = receivers.map((e) => e.id).indexOf(id);
  if (i !== -1) {
    receivers.splice(i, 1);
    writeReceivers(receivers);
    return true;
  }
  return false;
};

const plusProcess = async (
  params: Array<any>,
  isNegative: boolean,
  sender: string,
  id: string,
  chatName: string
) => {
  let [, duration, atSlot] = params;
  atSlot = Math.max(1, atSlot === "now" ? idx : atSlot === "next" ? idx + 1 : parseInt(atSlot));
  duration = isNegative ? -parseInt(duration) : parseInt(duration);
  if (
    !(
      Number.isInteger(duration) &&
      Number.isInteger(atSlot) &&
      atSlot < slots.length &&
      duration !== 0
    )
  )
    throw "wrong argument";
  for (let i = atSlot; i < slots.length; ++i) {
    shift[i] += duration;
    slotsBeginTime[i] += duration;
  }
  writeBackupShift(shift);
  totalShift += duration;
  const result = await addReceiverId(id, null, chatName);
  const { receivers } = readReceivers();
  const props = [
    duration,
    totalShift,
    atSlot,
    idx,
    slots[atSlot][BEGIN_TIME],
    slots[atSlot][END_TIME],
    shift[atSlot],
    sender,
  ];
  if (PUSH_MESSAGE_TYPE == "flex") {
    const flex = generatePlusProcessFlex(props);
    receivers.forEach(async (e) => {
      await pushFlex(e.id, flex);
    });
  } else if (PUSH_MESSAGE_TYPE == "text") {
    const text = generatePlusProcessText(props);
    receivers.forEach(async (e) => {
      await pushText(e.id, text);
    });
  }
  setTimeout(announce, 0.5 * 1000);
  return result;
};

export {
  initAnnouncer,
  addReceiverId,
  removeReceiverId,
  plusProcess,
  getVariables,
  getTotalReceivers,
};
