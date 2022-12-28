import * as dotenv from "dotenv";
import { constants } from "./constants";
const { ALLOW_PUSH_MESSAGE } = constants;
const env = dotenv.config().parsed;
let client = null;
function initClient(c) {
  client = c;
}
async function pushFlex(id: string, bubble: object, altText: string) {
  let messages = [];
  messages.push({ type: "flex", altText: altText, contents: bubble });
  if (!ALLOW_PUSH_MESSAGE) {
    console.log("pushFlex", id, messages);
    return;
  }
  if (messages.length === 0) return;
  await client.pushMessage(id, messages).catch((err) => {
    console.log(err);
  });
}
async function replyFlex(replyToken: string, carousel: object) {
  if (!carousel) return;
  await client
    .replyMessage(replyToken, {
      type: "flex",
      altText:
        "พิมพ์ !start หรือ !start ตามด้วยชื่อฝ่าย (เช่น !start plan coop) เพื่อเริ่มแจ้ง Slot",
      contents: carousel,
    })
    .catch((err) => {
      console.log(err);
    });
}
async function replyText(replyToken: string, text: string) {
  if (text.length === 0) return;
  await client.replyMessage(replyToken, { type: "text", text: text }).catch((err) => {
    console.log(err);
  });
}

async function pushText(id: string, bundle: string | Array<string>) {
  let messages = [];
  if (Array.isArray(bundle)) {
    bundle.forEach((element: string) => {
      if (element.length !== 0) messages.push({ type: "text", text: element });
    });
  } else if (bundle.length !== 0) {
    messages.push({ type: "text", text: bundle });
  }
  if (!ALLOW_PUSH_MESSAGE) {
    console.log("pushText", id, messages);
    return;
  }
  if (messages.length === 0) return;
  await client.pushMessage(id, messages).catch((err) => {
    console.log(err);
  });
}
async function getSender(groupId: string, userId: string) {
  let sender = "Unknown Sender";
  if (groupId !== null) {
    await client
      .getGroupMemberProfile(groupId, userId)
      .then((profile) => {
        sender = profile.displayName;
      })
      .catch((err) => {
        console.log(err);
      });
  } else {
    await client
      .getProfile(userId)
      .then((profile) => {
        sender = profile.displayName;
      })
      .catch((err) => {
        console.log(err);
      });
  }
  return sender;
}
async function getGroupName(id: string) {
  let groupName = "Unknown Group";
  await client
    .getGroupSummary(id)
    .then((res) => {
      groupName = res.groupName;
    })
    .catch((err) => {
      console.log(err);
    });
  return groupName;
}
async function countGroupMembers(id: string) {
  let count = 0;
  await client
    .getGroupMembersCount(id)
    .then((res) => {
      count = res.count;
    })
    .catch((err) => {
      console.log(err);
    });
  return count;
}
async function setWebhookEndpointUrl(endpoint: string) {
  const res = await client.setWebhookEndpointUrl(endpoint + "/webhook").catch((err) => {
    console.log(err);
  });
  return Boolean(res);
}
async function testWebhookEndpoint(endpoint?: string) {
  const res = await client.testWebhookEndpoint().catch((err) => {
    console.log(err);
  });
  return res && res.success && res.statusCode == 200;
}
export {
  initClient,
  replyText,
  pushText,
  getSender,
  getGroupName,
  countGroupMembers,
  setWebhookEndpointUrl,
  testWebhookEndpoint,
  pushFlex,
  replyFlex,
};
