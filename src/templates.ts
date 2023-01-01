import { configs } from "./config";
const { NUM, BEGIN_TIME, END_TIME, DURATION, OWNER, NAME, LOCATION, LEADER, MEMBER, DETAILS } =
  configs;
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
      ? slot[BEGIN_TIME] + " - " + slot[END_TIME]
      : BEGIN_TIME !== -1
      ? slot[BEGIN_TIME]
      : ""
  }\n${OWNER !== -1 ? slot[OWNER] : ""} ${NAME !== -1 ? slot[NAME] : ""}\n${
    LEADER !== -1 ? "ผต. " + slot[LEADER] : ""
  }\n${LOCATION !== -1 ? "📌 " + slot[LOCATION] : ""}\n${
    MEMBER !== -1 ? "🏃 " + slot[MEMBER] : ""
  }`;
}
function generateSlotInfoFlex(slot: Array<any>, shift: number, full = false): Array<any> {
  const beginTimeArray = slot[BEGIN_TIME].split(":").map((e: string) => Number.parseInt(e)),
    endTimeArray = slot[END_TIME].split(":").map((e: string) => Number.parseInt(e));
  const beginTimeDateObject = new Date(
      (beginTimeArray[0] * 60 + beginTimeArray[1] + shift) * 60000
    ),
    endTimeDateObject = new Date((endTimeArray[0] * 60 + endTimeArray[1] + shift) * 60000);
  slot[BEGIN_TIME] = beginTimeDateObject.toISOString().substring(11, 16);
  slot[END_TIME] = endTimeDateObject.toISOString().substring(11, 16);
  const leaderPhone =
    LEADER !== -1 && slot[LEADER]
      ? slot[LEADER].match(/(?:[-+() ]*\d){10,13}/gm).map(function (s) {
          return s.trim().replace("(", "").replace(")", "");
        })
      : [null];
  const callLeaderBtn = {
    type: "box",
    layout: "vertical",
    contents: [
      {
        type: "text",
        text: "โทรหา ผต.",
        adjustMode: "shrink-to-fit",
        size: "xs",
        align: "center",
        color: "#ffffff",
      },
    ],
    backgroundColor: "#c74444",
    cornerRadius: "sm",
    action: {
      type: "uri",
      uri: `tel:${leaderPhone[0]}`,
    },
    paddingAll: "xs",
  };
  const fullDetailBtn = {
    type: "box",
    layout: "vertical",
    contents: [
      {
        type: "text",
        text: "More detail",
        align: "center",
        adjustMode: "shrink-to-fit",
        size: "xs",
        color: "#ffffff",
      },
    ],
    backgroundColor: "#4490c7",
    cornerRadius: "sm",
    action: {
      type: "postback",
      label: "action",
      data: `slotDetail ${NUM !== -1 ? slot[NUM] : "0"}`,
    },
    paddingAll: "xs",
  };
  const slotHeader = {
    type: "box",
    layout: "horizontal",
    contents: [
      {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: NUM !== -1 ? "#" + slot[NUM] : "#0",
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
            text:
              BEGIN_TIME !== -1 && END_TIME !== -1 && slot[BEGIN_TIME] !== slot[END_TIME]
                ? slot[BEGIN_TIME] + " - " + slot[END_TIME]
                : BEGIN_TIME !== -1
                ? slot[BEGIN_TIME]
                : "ไม่มีเวลาระบุ",
            weight: "bold",
            align: "end",
            wrap: true,
            gravity: "center",
            color: shift > 0 ? "#ff1c1c" : shift < 0 ? "#ffff00" : undefined,
          },
        ],
      },
    ],
    paddingBottom: "none",
    paddingTop: "none",
    paddingEnd: "sm",
    paddingStart: "none",
  };
  const slotFooter = {
    type: "box",
    layout: "horizontal",
    contents: [callLeaderBtn, fullDetailBtn],
    paddingAll: "sm",
    spacing: "md",
  };
  const members = {
    type: "box",
    layout: "vertical",
    contents: [
      {
        type: "text",
        text: "ผู้รับผิดชอบ",
        weight: "bold",
        decoration: "underline",
        size: "xs",
      },
      {
        type: "text",
        text: MEMBER !== -1 ? slot[MEMBER] : "unknown",
        wrap: true,
        size: "sm",
        maxLines: full ? 40 : 12,
      },
    ],
    paddingAll: "xs",
    paddingStart: "sm",
  };
  const slotTitle = [
    {
      type: "text",
      text: OWNER !== -1 && slot[OWNER] ? slot[OWNER] : "-",
      align: "center",
      wrap: true,
      weight: "bold",
      size: "sm",
    },
    {
      type: "text",
      text: NAME !== -1 && slot[NAME] ? slot[NAME] : "กิจกรรมไม่มีชื่อ",
      align: "center",
      wrap: true,
      size: "sm",
    },
    {
      type: "separator",
      margin: "none",
    },
  ];
  const slotLeaderAndPlace = [
    {
      type: "text",
      text: "ผู้ตัดสินใจสูงสุด",
      weight: "bold",
      decoration: "underline",
      size: "xs",
    },
    {
      type: "text",
      text: LEADER !== -1 && slot[LEADER] ? slot[LEADER] : "unknown",
      wrap: true,
      gravity: "top",
      size: "sm",
    },
    {
      type: "text",
      text: "สถานที่",
      weight: "bold",
      decoration: "underline",
      size: "xs",
    },
    {
      type: "text",
      text: LOCATION !== -1 && slot[LOCATION] ? slot[LOCATION] : "unknown",
      size: "sm",
      wrap: full,
    },
  ];
  // -----------Full Slot (3)-----------------------------------------------------------
  if (full) {
    return [
      {
        type: "bubble",
        size: "kilo",
        header: slotHeader,
        body: {
          type: "box",
          layout: "vertical",
          contents: [
            ...slotTitle,
            {
              type: "box",
              layout: "vertical",
              contents: slotLeaderAndPlace,
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
        footer: {
          type: "box",
          layout: "horizontal",
          contents: [callLeaderBtn],
          paddingAll: "sm",
          spacing: "md",
        },
        styles: {
          header: {
            backgroundColor: "#aa77f7",
          },
          footer: {
            backgroundColor: "#aa77f7",
          },
        },
      },
      {
        type: "bubble",
        header: slotHeader,
        body: members,
        size: "kilo",
        styles: {
          header: {
            backgroundColor: "#aa77f7",
          },
        },
      },
      {
        type: "bubble",
        header: slotHeader,
        body: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "text",
              text: "รายละเอียด",
              weight: "bold",
              decoration: "underline",
              size: "xs",
            },
            {
              type: "text",
              text: DETAILS !== -1 ? slot[DETAILS] : "-",
              wrap: true,
              size: "sm",
            },
          ],
          paddingAll: "xs",
          paddingStart: "sm",
        },
        size: "kilo",
        styles: {
          header: {
            backgroundColor: "#aa77f7",
          },
        },
      },
    ];
  }
  // ---------------2 Slots-------------------------------------------------------
  if (slot[MEMBER].split("\n").length > 1) {
    return [
      {
        type: "bubble",
        size: "micro",
        header: slotHeader,
        body: {
          type: "box",
          layout: "vertical",
          contents: [
            ...slotTitle,
            {
              type: "box",
              layout: "vertical",
              contents: [
                ...slotLeaderAndPlace,
                {
                  type: "text",
                  text: "(ผู้รับผิดชอบดูช่องถัดไป)",
                  size: "xxs",
                  style: "italic",
                  align: "center",
                  color: "#7c838f",
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
        footer: slotFooter,
        styles: {
          header: {
            backgroundColor: "#fc9003",
          },
          footer: {
            backgroundColor: "#fc9003",
          },
        },
      },
      {
        type: "bubble",
        size: "micro",
        header: slotHeader,
        body: members,
        styles: {
          header: {
            backgroundColor: "#fc9003",
          },
        },
      },
    ];
  }
  // -----------1 Slot-----------------------------------------------------------
  return [
    {
      type: "bubble",
      size: "micro",
      header: slotHeader,
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          ...slotTitle,
          {
            type: "box",
            layout: "vertical",
            contents: [
              ...slotLeaderAndPlace,
              {
                type: "text",
                text: "ผู้รับผิดชอบ",
                weight: "bold",
                decoration: "underline",
                size: "xs",
              },
              {
                type: "text",
                text: MEMBER !== -1 && slot[MEMBER] ? slot[MEMBER] : "unknown",
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
      footer: slotFooter,
      styles: {
        header: {
          backgroundColor: "#fc9003",
        },
        footer: {
          backgroundColor: "#fc9003",
        },
      },
    },
  ];
}
function generatePlusProcessFlex(props: Array<any>) {
  const [duration, totalShift, atSlot, idx, beginTime, endTime, shift, sender] = props;
  let time = atSlot === idx ? endTime : beginTime;
  const timeArray = time.split(":").map((e: string) => Number.parseInt(e));
  const timeDateObject = new Date((timeArray[0] * 60 + timeArray[1] + shift) * 60000);
  time = timeDateObject.toISOString().substring(11, 16);
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
          color: duration < 0 ? "#000000" : "#ffffff",
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
              text: time,
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
        backgroundColor: duration < 0 ? "#ffff00" : "#fc0000",
      },
      footer: {
        backgroundColor: duration < 0 ? "#ffff54" : "#ff5454",
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
  return [
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
  ];
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
  generateSlotInfoFlex,
};
