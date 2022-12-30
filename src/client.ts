import * as line from "@line/bot-sdk";
import { configs } from "./config";
import { validatePushMessage } from "./validateMessage";
const { ALLOW_PUSH_MESSAGE } = configs;
let client = null;
function initClient(lineConfig: { channelAccessToken: string; channelSecret: string }) {
  client = new line.Client(lineConfig);
}
async function pushFlex(
  id: string,
  elements: object | Array<Array<object>>,
  altText: string | Array<string>
) {
  let messages = [];
  if (Array.isArray(elements)) {
    for (let i = 0; i < elements.length; ++i) {
      if (elements[i].length !== 0)
        messages.push({
          type: "flex",
          altText: altText[i],
          contents: { type: "carousel", contents: elements[i] },
        });
    }
  } else if (elements) messages.push({ type: "flex", altText: altText, contents: elements });
  if (!ALLOW_PUSH_MESSAGE) {
    console.log("pushFlex", id, messages);
    return;
  }
  if (messages.length === 0) return;
  await client.pushMessage(id, messages).catch((err) => {
    console.log(err);
  });
}
async function replyFlex(
  replyToken: string,
  carousel: Array<object>,
  altText: string,
  notificationDisabled = false
) {
  if (!carousel) return;
  await client
    .replyMessage(
      replyToken,
      {
        type: "flex",
        altText: altText,
        contents: { type: "carousel", contents: carousel },
      },
      notificationDisabled
    )
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
  } else if (bundle.length !== 0) messages.push({ type: "text", text: bundle });
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
async function testWebhookEndpointUrl() {
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
  testWebhookEndpointUrl,
  pushFlex,
  replyFlex,
};
