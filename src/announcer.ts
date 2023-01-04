import { readProcess } from "./file-manager/readcsv";
import { configs } from "./config";
const {
  BEGIN_TIME,
  END_TIME,
  OWNER,
  PUSH_MESSAGE_TYPE,
  MAX_BUBBLE_PER_CAROUSEL,
  ANNOUNCE_INTERVAL,
} = configs;
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
  generateSlotInfoFlex,
  generateSlotInfoText,
} from "./templates";
import { logger } from "./logger";
let intervalId = null,
  startDate = null,
  slots: any,
  idx = 0,
  shift: Array<number>,
  slotsBeginTime: Array<number>,
  totalShift = 0;
type AddReceiverResults = null | number | Array<number | string>;
type Receiver = { id: string; chatName: string; members: number; preferences: Array<string> };
async function initAnnouncer() {
  if (intervalId !== null) clearInterval(intervalId);
  slots = await readProcess();
  slotsBeginTime = new Array(slots.length + 10).fill(0);
  let dateDiff = 0,
    temp = new Array(slots.length + 10).fill(0);
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
  intervalId = setInterval(announce, ANNOUNCE_INTERVAL * 1000);
}
function resetIdx(): number {
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
function getTotalReceivers(receivers: Array<Receiver>): number {
  return receivers.reduce((totalReceivers: number, { members }) => {
    return totalReceivers + (Number.isInteger(members) ? members : 0);
  }, 0);
}
function getVariables(): Array<any> {
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
    throw new Error(err);
  }
}
function getCurrentTime(): number {
  const currentTime = new Date();
  const currentDate = new Date(currentTime.toDateString());
  const dateDiff = (currentDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24);
  return currentTime.getHours() * 60 + currentTime.getMinutes() + 60 * 24 * dateDiff;
}
function getNextSlotTime(index = idx): number {
  if (index >= slots.length - 1) {
    return Number.POSITIVE_INFINITY;
  }
  return slotsBeginTime[index + 1];
}
function filterSlotsElement(
  slotsElement: Array<string | object>,
  preferences: Array<string>,
  slotsOwner: Array<string>,
  bubblesPattern?: Array<number>
): Array<any> {
  let filteredSlotsElement = [],
    filteredBubblesPattern = [],
    isMatch: boolean;
  if (preferences.length === 0 || OWNER === -1) {
    return [slotsElement, bubblesPattern];
  }
  for (let i = 0; i < slotsElement.length; ++i) {
    isMatch = false;
    preferences.forEach((pref: string) => {
      if (slotsOwner[i].replace("COOR", "COOP").match(pref)) isMatch = true;
    });
    if (isMatch) {
      filteredSlotsElement.push(slotsElement[i]);
      filteredBubblesPattern.push(bubblesPattern[i]);
    }
  }
  return [filteredSlotsElement, filteredBubblesPattern];
}
function getAltText(carousel: Array<any>): string {
  const lastSlotNum = Number.parseInt(
    carousel[carousel.length - 1].header.contents[0].contents[0].text.replace("#", "") || 0
  );
  if (lastSlotNum === 0) return "Unknown Slot";
  let slot = [...slots[lastSlotNum]];
  return generateSlotInfoText(slot, shift[lastSlotNum]);
}
function getSlotDetail(slotNum: number): Array<object> {
  if (slotNum <= 0 || slotNum >= slots.length) throw new Error("Invalid slotNum");
  let slot = [...slots[slotNum]];
  return generateSlotInfoFlex(slot, shift[slotNum], true);
}
async function announce() {
  if (idx >= slots.length - 1) {
    idx = 0;
    return;
  }
  let slotsText: Array<string> = [],
    slotsOwner: Array<string> = [],
    bubbles: Array<object> = [],
    bubblesPattern: Array<number> = [],
    countCarousel = 0,
    current = 0,
    nextSlotTime = getNextSlotTime(),
    currentTime = getCurrentTime();
  while (nextSlotTime === currentTime || (nextSlotTime <= currentTime && idx !== 0)) {
    let slot = [...slots[idx + 1]];
    if (PUSH_MESSAGE_TYPE == "text") {
      slotsText.push(generateSlotInfoText(slot, shift[idx + 1]));
      slotsOwner.push(OWNER !== -1 ? slot[OWNER].toUpperCase() : "");
      if (slotsText.length >= 5) {
        setTimeout(announce, 0.5 * 1000);
        break;
      }
    } else {
      const slotBubble = generateSlotInfoFlex(slot, shift[idx + 1]);
      if (current + slotBubble.length > MAX_BUBBLE_PER_CAROUSEL) {
        countCarousel++;
        current = 0;
      }
      current += slotBubble.length;
      if (countCarousel >= 5) {
        setTimeout(announce, 0.5 * 1000);
        break;
      }
      slotBubble.forEach((bubble) => {
        bubbles.push(bubble);
        slotsOwner.push(OWNER !== -1 ? slot[OWNER].toUpperCase() : "");
        bubblesPattern.push(slotBubble.length);
      });
    }
    idx++;
    nextSlotTime = getNextSlotTime();
    currentTime = getCurrentTime();
    logger.info(`Announcing #${idx}`);
  }
  if (slotsText.length === 0 && bubbles.length === 0) return;
  const { receivers } = readReceivers();
  receivers.forEach(async (receiver: Receiver) => {
    if (PUSH_MESSAGE_TYPE == "flex") {
      const [filteredBubbles, filteredBubblesPattern] = filterSlotsElement(
        bubbles,
        receiver.preferences,
        slotsOwner,
        bubblesPattern
      );
      let carousels = [],
        carousel = [],
        altTextList = [];
      for (let i = 0; i < filteredBubbles.length; ) {
        if (filteredBubblesPattern[i] + carousel.length > MAX_BUBBLE_PER_CAROUSEL) {
          carousels.push(carousel);
          altTextList.push(getAltText(carousel));
          carousel = [];
        }
        let t = filteredBubblesPattern[i];
        for (let j = 0; j < t; ++j, ++i) carousel.push(filteredBubbles[i]);
      }
      if (carousel.length !== 0) {
        carousels.push(carousel);
        altTextList.push(getAltText(carousel));
        carousel = [];
      }
      await pushFlex(receiver.id, carousels, altTextList);
    } else if (PUSH_MESSAGE_TYPE == "text")
      await pushText(
        receiver.id,
        filterSlotsElement(slotsText, receiver.preferences, slotsOwner)[0]
      );
  });
}

async function addReceiver(
  id: string,
  arg: Array<string>,
  chatName: string
): Promise<AddReceiverResults> {
  const currentTime = getCurrentTime();
  const { receivers } = readReceivers();
  let i = receivers.map((e: Receiver) => e.id).indexOf(id);
  if (i === -1) {
    const members = id.charAt(0) === "C" ? await countGroupMembers(id) : 1;
    receivers.push({
      id: id,
      chatName: chatName,
      members: members,
      preferences: [],
    });
    i = receivers.length - 1;
  } else if (arg === null) return null;
  if (arg !== null) {
    receivers[i].preferences = [];
    arg.forEach((e) => {
      if (e.toUpperCase() === "COOR") e = "COOP";
      if (e.length !== 0) receivers[i].preferences.push(e.toUpperCase());
    });
  }
  writeReceivers(receivers);
  if (idx >= slots.length - 1 || (idx === 0 && getNextSlotTime(slots.length - 2) < currentTime))
    return -1;
  const beginTimeArray = slots[idx + 1][BEGIN_TIME].split(":").map((e: string) =>
    Number.parseInt(e)
  );
  const beginTimeDateObject = new Date(
    (beginTimeArray[0] * 60 + beginTimeArray[1] + shift[idx + 1]) * 60000
  );
  return [idx + 1, beginTimeDateObject.toISOString().substring(11, 16)];
}

async function removeReceiver(id: string): Promise<boolean> {
  const { receivers } = readReceivers();
  const i = receivers.map((e: Receiver) => e.id).indexOf(id);
  if (i !== -1) {
    receivers.splice(i, 1);
    writeReceivers(receivers);
    return true;
  }
  return false;
}

async function plusProcess(
  params: Array<any>,
  isNegative: boolean,
  sender: string,
  id: string,
  chatName: string
): Promise<AddReceiverResults> {
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
    throw new Error("wrong argument");
  for (let i = atSlot; i < slots.length; ++i) {
    shift[i] += duration;
    slotsBeginTime[i] += duration;
  }
  writeBackupShift(shift);
  totalShift += duration;
  const result = await addReceiver(id, null, chatName);
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
    const bubble = generatePlusProcessFlex(props);
    const altText = `${
      duration < 0 ? "" : "+"
    }${duration} นาที ตั้งแต่ Slot #${atSlot} รวม ${totalShift} นาที สั่งโดย ${sender}`;
    receivers.forEach(async (e: Receiver) => {
      await pushFlex(e.id, bubble, altText);
    });
  } else if (PUSH_MESSAGE_TYPE == "text") {
    const text = generatePlusProcessText(props);
    receivers.forEach(async (e: Receiver) => {
      await pushText(e.id, text);
    });
  }
  setTimeout(announce, 0.5 * 1000);
  return result;
}

export {
  initAnnouncer,
  addReceiver,
  removeReceiver,
  plusProcess,
  getVariables,
  getTotalReceivers,
  getSlotDetail,
};
