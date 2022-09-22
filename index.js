const line = require("@line/bot-sdk");
const express = require("express");
const axios = require("axios").default;
const dotenv = require("dotenv");
const { handleEvent } = require("./handleEvent");

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
    console.log(events);
    return events.length > 0
      ? await events.map((item) => handleEvent(item, client))
      : res.status(200).send("OK");
  } catch (error) {
    console.log(error);
    res.status(500).end();
  }
});

app.listen(3000, () => {
  console.log("on port 3000");
});
