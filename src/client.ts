import axios from "axios";
import * as dotenv from "dotenv";
const env = dotenv.config().parsed;
const config = {
  headers: { Authorization: `Bearer ${env.ACCESS_TOKEN_DEMO}` },
};
let client = null;
function initClient(c) {
  client = c;
}
async function replyText(replyToken, text) {
  await client
    .replyMessage(replyToken, {
      type: "text",
      text: text,
    })
    .catch((err) => {
      console.log(err);
    });
}
async function pushText(id, bundle) {
  let messages = [];
  if (Array.isArray(bundle)) {
    bundle.forEach((element) => {
      messages.push({
        type: "text",
        text: element,
      });
    });
  } else {
    messages.push({
      type: "text",
      text: bundle,
    });
  }
  // console.log(id, messages);
  // return;
  if (messages.length === 0) return;
  await client.pushMessage(id, messages).catch((err) => {
    console.log(err);
  });
}
async function getSender(groupId, userId) {
  let sender = "Unknown";
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
async function getName(id) {
  let name = "Unknown";
  if (id[0] === "U") {
    await client
      .getProfile(id)
      .then((profile) => {
        name = profile.displayName;
      })
      .catch((err) => {
        console.log(err);
      });
  } else if (id[0] === "C") {
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