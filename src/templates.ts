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
          url: "https://cdn-icons-png.flaticon.com/512/1378/1378644.png",
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
function helpFlex() {
  return {
    type: "carousel",
    contents: [
      {
        type: "bubble",
        size: "kilo",
        header: {
          type: "box",
          layout: "horizontal",
          contents: [
            {
              type: "box",
              layout: "vertical",
              contents: [
                {
                  type: "text",
                  text: "หน้า 1",
                  weight: "bold",
                  adjustMode: "shrink-to-fit",
                  size: "xs",
                },
              ],
              backgroundColor: "#c9eb34",
              justifyContent: "center",
              flex: 0,
              paddingAll: "xs",
            },
            {
              type: "box",
              layout: "vertical",
              contents: [
                {
                  type: "text",
                  text: "คำสั่งพื้นฐาน",
                  weight: "bold",
                  align: "center",
                  wrap: true,
                  gravity: "center",
                },
              ],
            },
          ],
          paddingBottom: "none",
          paddingTop: "none",
          paddingEnd: "sm",
          paddingStart: "none",
        },
        body: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "box",
              layout: "vertical",
              contents: [
                {
                  type: "text",
                  text: "เริ่มให้บอทแจ้ง Slot และรับข่าวสารการ +- Process",
                  weight: "bold",
                  decoration: "underline",
                  size: "xs",
                  wrap: true,
                },
                {
                  type: "text",
                  text: "- !start จะเป็นการบอกทุก Slot",
                  wrap: true,
                  gravity: "top",
                  size: "sm",
                },
                {
                  type: "text",
                  text: "- !start <List ของชื่อฝ่าย> จะเป็นการบอกเฉพาะของฝ่ายนั้น ๆ\nเช่น !start plan coop จะเป็นการบอก Slot ที่เป็นของฝ่ายแผนกับฝ่ายประสาน",
                  size: "sm",
                  wrap: true,
                },
                {
                  type: "text",
                  text: "- !stop หยุดให้บอทแจ้ง Slot และหยุดรับข่าวสารการ +- Process",
                  size: "sm",
                  wrap: true,
                },
              ],
              paddingStart: "sm",
              paddingEnd: "xs",
              margin: "sm",
              justifyContent: "center",
            },
          ],
          paddingAll: "xs",
          spacing: "xs",
          justifyContent: "space-between",
        },
        styles: {
          header: {
            backgroundColor: "#66c8e3",
          },
          footer: {
            backgroundColor: "#fc9003",
          },
        },
      },
      {
        type: "bubble",
        size: "kilo",
        header: {
          type: "box",
          layout: "horizontal",
          contents: [
            {
              type: "box",
              layout: "vertical",
              contents: [
                {
                  type: "text",
                  text: "หน้า 2",
                  weight: "bold",
                  adjustMode: "shrink-to-fit",
                  size: "xs",
                },
              ],
              backgroundColor: "#c9eb34",
              justifyContent: "center",
              flex: 0,
              paddingAll: "xs",
            },
            {
              type: "box",
              layout: "vertical",
              contents: [
                {
                  type: "text",
                  text: "คำสั่ง +- Process ทั้งค่าย",
                  weight: "bold",
                  align: "center",
                  wrap: true,
                  gravity: "center",
                },
              ],
            },
          ],
          paddingBottom: "none",
          paddingTop: "none",
          paddingEnd: "sm",
          paddingStart: "none",
        },
        body: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "text",
              text: "1. !+ <minutes> now บวกโปรเซสตามจำนวนนาทีที่ระบุตั้งแต่ Slot ปัจจุบัน เช่น !+ 30 now",
              size: "xs",
              wrap: true,
            },
            {
              type: "text",
              text: "2. !+ <minutes> next บวกโปรเซสตามจำนวนนาทีที่ระบุตั้งแต่ Slot ถัดไป\nเช่น !+ 15 next",
              wrap: true,
              size: "sm",
            },
            {
              type: "text",
              text: "3. !+ <minutes> <Slot No.> บวกโปรเซสตามจำนวนนาทีที่ระบุตั้งแต่ Slot ที่ระบุ\nเช่น !+ 20 154",
              wrap: true,
              size: "sm",
            },
            {
              type: "text",
              text: "4. ถ้าจะลบโปรเซสให้ใส่ !- แทน !+",
              wrap: true,
              size: "sm",
            },
          ],
          paddingAll: "xs",
          paddingStart: "sm",
        },
        styles: {
          header: {
            backgroundColor: "#66c8e3",
          },
        },
      },
      {
        type: "bubble",
        size: "kilo",
        header: {
          type: "box",
          layout: "horizontal",
          contents: [
            {
              type: "box",
              layout: "vertical",
              contents: [
                {
                  type: "text",
                  text: "หน้า 3",
                  weight: "bold",
                  adjustMode: "shrink-to-fit",
                  size: "xs",
                },
              ],
              backgroundColor: "#c9eb34",
              justifyContent: "center",
              flex: 0,
              paddingAll: "xs",
            },
            {
              type: "box",
              layout: "vertical",
              contents: [
                {
                  type: "text",
                  text: "หมายเหตุ",
                  weight: "bold",
                  align: "center",
                  wrap: true,
                  gravity: "center",
                },
              ],
            },
          ],
          paddingBottom: "none",
          paddingTop: "none",
          paddingEnd: "sm",
          paddingStart: "none",
        },
        body: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "text",
              text: "- โปรเซสแบบตารางยังใช้ได้เหมือนเดิม แชทบอทนี้เป็นทางเลือกเสริมสำหรับสตาฟค่าย\n- การ !start เฉย ๆ โดยที่ไม่ระบุฝ่ายอาจจะทำให้แชทที่คุยกันโดนดันได้\n- คนที่สั่ง +- โปรเซสแบบมั่ว ๆ จนสร้างความรำคาญจะถูกแบนจากการสั่ง +- เป็นรายบุคคล",
              wrap: true,
              size: "sm",
            },
          ],
          paddingAll: "xs",
          paddingStart: "sm",
        },
        footer: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "box",
              layout: "vertical",
              contents: [
                {
                  type: "text",
                  text: "View Presentation",
                  adjustMode: "shrink-to-fit",
                  size: "xs",
                  align: "center",
                  color: "#ffffff",
                },
              ],
              backgroundColor: "#34c6eb",
              cornerRadius: "sm",
              action: {
                type: "uri",
                uri: "https://docs.google.com/presentation/d/1_wiHBiMs6Dx3n4XP0IYYMnl4n5VU9UoUBYdjTOZIOyc/edit?usp=sharing",
              },
              paddingAll: "xs",
            },
            {
              type: "box",
              layout: "vertical",
              contents: [
                {
                  type: "text",
                  text: "View Document",
                  adjustMode: "shrink-to-fit",
                  size: "xs",
                  align: "center",
                  color: "#ffffff",
                },
              ],
              backgroundColor: "#dbe366",
              cornerRadius: "sm",
              action: {
                type: "uri",
                uri: "https://docs.google.com/document/d/1rs-aK5OV9isvC4HrIy0Rb4q3cD8NZsXymxfuG3JBWhs/edit?usp=share_link",
              },
              paddingAll: "xs",
            },
          ],
          paddingAll: "sm",
          spacing: "md",
        },
        styles: {
          header: {
            backgroundColor: "#66c8e3",
          },
        },
      },
    ],
  };
}
function helpText() {
  return "พิมพ์ !start หรือ !start ตามด้วยชื่อฝ่าย (เช่น !start plan coop) เพื่อเริ่มแจ้ง Slot\nหรือ !stop เพื่อหยุดการใช้งาน\nส่วนคู่มือแบบเต็ม ๆ ก็อันนี้เลยยย https://docs.google.com/document/d/1rs-aK5OV9isvC4HrIy0Rb4q3cD8NZsXymxfuG3JBWhs/edit?usp=sharing";
}
export {
  addReceiverReplyText,
  generateSlotInfoText,
  generatePlusProcessText,
  generatePlusProcessFlex,
  helpFlex,
  helpText,
};
