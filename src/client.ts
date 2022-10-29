import axios from "axios";
import * as dotenv from "dotenv";
const env = dotenv.config().parsed;
const config = {
  headers: {
    Authorization: `Bearer ${
      env.NODE_ENV === "development" ? env.ACCESS_TOKEN_DEMO : env.ACCESS_TOKEN
    }`,
  },
};
let client = null;
function initClient(c) {
  client = c;
}
async function replyText(replyToken, text: string) {
  if (text.length === 0) return;
  await client
    .replyMessage(replyToken, {
      type: "text",
      text: text,
    })
    .catch((err) => {
      console.log(err);
    });
}
async function pushText(id: string, bundle: string | Array<string>) {
  let messages = [];
  if (Array.isArray(bundle)) {
    bundle.forEach((element: string) => {
      if (element.length !== 0)
        messages.push({
          type: "text",
          text: element,
        });
    });
  } else {
    if (bundle.length !== 0)
      messages.push({
        type: "text",
        text: bundle,
      });
  }
  if (env.ALLOW_PUSH_MESSAGE === "false") {
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
async function getName(id: string) {
  let name = "Unknown Name";
  if (id.charAt(0) === "U") {
    await client
      .getProfile(id)
      .then((profile) => {
        name = profile.displayName;
      })
      .catch((err) => {
        console.log(err);
      });
  } else if (id.charAt(0) === "C") {
    await axios
      .get(`https://api.line.me/v2/bot/group/${id}/summary`, config)
      .then((summary) => {
        name = summary.data.groupName;
      })
      .catch();
  }
  return name;
}
export { initClient, replyText, pushText, getSender, getName };
