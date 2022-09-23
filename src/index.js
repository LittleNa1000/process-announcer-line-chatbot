const line = require("@line/bot-sdk");
const express = require("express");
const dotenv = require("dotenv");
const { handleEvent, initHandleEvent } = require("./handleEvent");
const { initAnnounce } = require("./announce");

const env = dotenv.config().parsed;
const app = express();

const lineConfig = {
  channelAccessToken: env.ACCESS_TOKEN,
  channelSecret: env.SECRET_TOKEN,
};
const client = new line.Client(lineConfig);

app.post("/webhook", line.middleware(lineConfig), async (req, res) => {
  try {
    const events = req.body.events;
    return events.length > 0
      ? await events.map((item) => handleEvent(item))
      : res.status(200).send("OK");
  } catch (error) {
    console.log(error);
    res.status(500).end();
  }
});

app.listen(env.PORT, () => {
  initHandleEvent(client);
  initAnnounce(client);
  console.log(`on port ${env.PORT}`);
});
