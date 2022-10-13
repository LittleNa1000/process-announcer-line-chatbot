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
  console.log(id, messages);
  return;
  await client.pushMessage(id, messages).catch((err) => {
    console.log(err);
  });
}
async function getName(groupId, userId) {
  let name = "Unknown";
  if (groupId !== null) {
    await client
      .getGroupMemberProfile(groupId, userId)
      .then((profile) => {
        name = profile.displayName;
      })
      .catch((err) => {
        console.log(err);
      });
  } else {
    await client
      .getProfile(userId)
      .then((profile) => {
        name = profile.displayName;
      })
      .catch((err) => {
        console.log(err);
      });
  }
  return name;
}
module.exports = { initClient, replyText, pushText, getName };
