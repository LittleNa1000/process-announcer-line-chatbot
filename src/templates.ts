import { constants } from "./constants";
const { NUM, BEGIN_TIME, END_TIME, DURATION, OWNER, NAME, LOCATION, LEADER, MEMBER, DETAILS } =
  constants;
function addReceiverReplyText(result: number | Array<number | string>) {
  return result === -1
    ? `ตอนนี้เลยเวลา Slot สุดท้ายของวันนี้แล้ว ไว้เรียกเราในวันอื่นน้า😴`
    : `เดี๋ยวจะเริ่มประกาศแล้วนะงับ😉\nSlot ถัดไป #${result[0]} เริ่ม ${result[1]} น้า`;
}
function generateSlotInfoText(slot: Array<any>, shift: number) {
  if (BEGIN_TIME !== -1 && shift !== 0) {
    slot[BEGIN_TIME] += ` (${shift >= 0 ? "+" : ""}${shift})`;
  }
  if (END_TIME !== -1 && shift !== 0) {
    slot[END_TIME] += ` (${shift >= 0 ? "+" : ""}${shift})`;
  }
  if (LOCATION !== -1) {
    slot[LOCATION] = slot[LOCATION].split("\n");
    slot[LOCATION] = `${slot[LOCATION][0]}${
      slot[LOCATION].length > 1 ? " และอีก " + (slot[LOCATION].length - 1) + " ที่" : ""
    }`;
  }
  if (MEMBER !== -1) {
    slot[MEMBER] = slot[MEMBER].split("\n");
    slot[MEMBER] = `${slot[MEMBER][0]}${
      slot[MEMBER].length > 1 ? " กับอีก " + (slot[MEMBER].length - 1) + " คน" : ""
    }`;
  }
  if (DETAILS !== -1) {
    slot[DETAILS] = slot[DETAILS].split("\n");
    slot[DETAILS] = `${slot[DETAILS][0]}${slot[DETAILS].length > 1 ? "..." : ""}`;
  }
  return `${NUM !== -1 ? "#" + slot[NUM] : ""} ${
    BEGIN_TIME !== -1 && END_TIME !== -1 && slot[BEGIN_TIME] !== slot[END_TIME]
      ? "⏱️ `" + slot[BEGIN_TIME] + " - " + slot[END_TIME] + "`"
      : BEGIN_TIME !== -1
      ? "🔔 `" + slot[BEGIN_TIME] + "`"
      : ""
  }\n${OWNER !== -1 ? slot[OWNER] : ""} ${NAME !== -1 ? slot[NAME] : ""}\n${
    LEADER !== -1 ? "ผต. " + slot[LEADER] : ""
  }\n${LOCATION !== -1 ? "📌 " + slot[LOCATION] : ""}\n${
    MEMBER !== -1 ? "🏃 " + slot[MEMBER] : ""
  }`;
}
function generatePlusProcessText(
  duration: number,
  totalShift: number,
  atSlot: number,
  idx: number,
  beginTime: string,
  endTime: string,
  shift: number,
  sender: string
) {
  return `🚨${duration < 0 ? "" : "+"}${duration} นาที ${
    totalShift === 0 ? "*Setzero*" : `รวม ${totalShift} นาที`
  } ตั้งแต่ Slot #${atSlot} น้างับ 🚨\n⌛Slot #${atSlot} ${
    atSlot === idx ? `จบ ${endTime}` : `เริ่ม ${beginTime} `
  } ${shift !== 0 ? `(${shift >= 0 ? "+" : ""}${shift})` : ""}\nสั่งโดย ${sender}`;
}
export { addReceiverReplyText, generateSlotInfoText, generatePlusProcessText };
