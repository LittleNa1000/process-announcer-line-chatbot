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
async function pushText(id, text) {
  await client
    .pushMessage(id, {
      type: "text",
      text: text,
    })
    .catch((err) => {
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
