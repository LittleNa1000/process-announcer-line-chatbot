import * as line from "@line/bot-sdk";
import * as express from "express";
import * as dotenv from "dotenv";
import { handleEvent, initHandleEvent } from "./src/handleEvent";
import { initAnnouncer } from "./src/announcer";
import { initClient } from "./src/client";
import { constants } from "./src/constants";
const { PROCESS_FILE_NAME } = constants;
const env = dotenv.config().parsed;
const app = express();

const lineConfig = {
  channelAccessToken:
    env!.NODE_ENV === "development"
      ? env!.ACCESS_TOKEN_DEMO
      : env!.ACCESS_TOKEN,
  channelSecret:
    env!.NODE_ENV === "development"
      ? env!.SECRET_TOKEN_DEMO
      : env!.SECRET_TOKEN,
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

app.listen(env!.PORT, async () => {
  initClient(client);
  initHandleEvent();
  await initAnnouncer();
  console.log(
    `On port ${env!.PORT}, process: ${PROCESS_FILE_NAME}, NODE_ENV: ${
      env!.NODE_ENV
    }, Allow push messages: ${env!.ALLOW_PUSH_MESSAGE}`
  );
});
