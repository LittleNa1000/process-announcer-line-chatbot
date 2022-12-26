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
function generateSlotInfoFlex(slot: Array<any>, shift: number): Array<any> {
  return;
}
function generatePlusProcessFlex(props: Array<number | string>) {
  const [duration, totalShift, atSlot, idx, beginTime, endTime, shift, sender] = props;
  return {
    type: "bubble",
    size: "kilo",
    header: {
      type: "box",
      layout: "horizontal",
      contents: [
        {
          type: "image",
          url: "https://1417094351.rsc.cdn77.org/articles/2829/2828052/thumbnail/large.gif?1",
          size: "xxs",
          flex: 0,
        },
        {
          type: "text",
          text: `${duration < 0 ? "" : "+"}${duration} นาที ตั้งแต่ Slot #${atSlot}`,
          align: "center",
          color: `${duration < 0 ? "#000000" : "#ffffff"}`,
          weight: "bold",
          wrap: true,
          gravity: "center",
        },
      ],
      paddingAll: "xs",
      spacing: "xs",
      paddingStart: "md",
      paddingTop: "sm",
    },
    body: {
      type: "box",
      layout: "vertical",
      contents: [
        {
          type: "box",
          layout: "horizontal",
          contents: [
            {
              type: "text",
              text: "รวมทั้งหมด",
              size: "sm",
              flex: 0,
            },
            {
              type: "text",
              text: `${totalShift} นาที`,
              size: "sm",
              weight: "bold",
              align: "end",
              wrap: true,
            },
          ],
        },
        {
          type: "box",
          layout: "horizontal",
          contents: [
            {
              type: "text",
              text: `Slot #${atSlot} ${atSlot === idx ? "จบ" : "เริ่ม"}`,
              size: "sm",
              flex: 0,
            },
            {
              type: "text",
              text: `${atSlot === idx ? endTime : beginTime} ${
                shift !== 0 ? `(${shift >= 0 ? "+" : ""}${shift})` : ""
              }`,
              size: "sm",
              weight: "bold",
              align: "end",
              wrap: true,
            },
          ],
        },
      ],
      spacing: "xs",
      justifyContent: "space-between",
      paddingAll: "xs",
      paddingStart: "lg",
      paddingEnd: "xl",
    },
    footer: {
      type: "box",
      layout: "horizontal",
      contents: [
        {
          type: "text",
          text: `สั่งโดย ${sender}`,
          align: "start",
          size: "xs",
          wrap: true,
          flex: 55,
          gravity: "center",
        },
        {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "text",
              text: `รายละเอียด Slot #${atSlot}`,
              align: "center",
              adjustMode: "shrink-to-fit",
              size: "xxs",
              color: "#ffffff",
            },
          ],
          backgroundColor: "#4490c7",
          cornerRadius: "sm",
          action: {
            type: "postback",
            label: "Plus Process",
            data: `slotDetail ${atSlot}`,
          },
          paddingAll: "xs",
          justifyContent: "center",
          flex: 45,
        },
      ],
      paddingAll: "sm",
      paddingStart: "md",
      paddingEnd: "md",
      spacing: "xs",
    },
    styles: {
      header: {
        backgroundColor: `${duration < 0 ? "#ffff00" : "#fc0000"}`,
      },
      footer: {
        backgroundColor: `${duration < 0 ? "#ffff54" : "#ff5454"}`,
      },
    },
  };
}
function generatePlusProcessText(props: Array<number | string>) {
  const [duration, totalShift, atSlot, idx, beginTime, endTime, shift, sender] = props;
  return `🚨${duration < 0 ? "" : "+"}${duration} นาที ${
    totalShift === 0 ? "*Setzero*" : `รวม ${totalShift} นาที`
  } ตั้งแต่ Slot #${atSlot} น้างับ 🚨\n⌛Slot #${atSlot} ${
    atSlot === idx ? `จบ ${endTime}` : `เริ่ม ${beginTime} `
  } ${shift !== 0 ? `(${shift >= 0 ? "+" : ""}${shift})` : ""}\nสั่งโดย ${sender}`;
}
export {
  addReceiverReplyText,
  generateSlotInfoText,
  generatePlusProcessText,
  generatePlusProcessFlex,
};
