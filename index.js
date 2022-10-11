const line = require("@line/bot-sdk");
const express = require("express");
const dotenv = require("dotenv");
const { handleEvent, initHandleEvent } = require("./src/handleEvent");
const { initAnnouncer } = require("./src/announcer");

const env = dotenv.config().parsed;
const app = express();

const lineConfig = {
  channelAccessToken: env.ACCESS_TOKEN_DEMO,
  channelSecret: env.SECRET_TOKEN_DEMO,
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
  initHandleEvent(client);
  await initAnnouncer(client);
  console.log(`on port ${env.PORT}`);
});
