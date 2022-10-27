const line = require("@line/bot-sdk");
const express = require("express");
const dotenv = require("dotenv");
const { handleEvent, initHandleEvent } = require("./src/handleEvent");
const { initAnnouncer } = require("./src/announcer");
const { initClient } = require("./src/client");

const env = dotenv.config().parsed;
const app = express();

const lineConfig = {
  channelAccessToken:
    env.NODE_ENV === "development" ? env.ACCESS_TOKEN_DEMO : env.ACCESS_TOKEN,
  channelSecret:
    env.NODE_ENV === "development" ? env.SECRET_TOKEN_DEMO : env.SECRET_TOKEN,
};
const client = new line.Client(lineConfig);

app.post("/webhook", line.middleware(lineConfig), async (req, res) => {
  try {
    const events = req.body.events;
    return events.length > 0
      ? await events.map((item) => handleEvent(item))
      : res.status(200).send("OK");
  } catch (err) {
    console.log(err);
    res.status(500).end();
  }
});

app.listen(env.PORT, async () => {
  initClient(client);
  initHandleEvent();
  await initAnnouncer();
  console.log(`on port ${env.PORT}`);
});
