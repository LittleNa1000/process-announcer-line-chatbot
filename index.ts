import * as line from "@line/bot-sdk";
import * as express from "express";
import * as dotenv from "dotenv";
import { handleEvent } from "./src/handleEvent";
import { initSystem } from "./src/init";
import { logger } from "./src/logger";

const env = dotenv.config().parsed;
const app = express();

const lineConfig = {
  channelAccessToken: env!.NODE_ENV === "development" ? env!.ACCESS_TOKEN_DEMO : env!.ACCESS_TOKEN,
  channelSecret: env!.NODE_ENV === "development" ? env!.SECRET_TOKEN_DEMO : env!.SECRET_TOKEN,
};

app.post("/webhook", line.middleware(lineConfig), async (req, res) => {
  try {
    const events = req.body.events;
    return events.length > 0
      ? await events.map((item) => handleEvent(item))
      : res.status(200).send("OK");
  } catch (err) {
    logger.error(err.stack);
    res.status(500).end();
  }
});

app.listen(env!.PORT, async () => {
  logger.info(`On port ${env!.PORT}`);
  initSystem(lineConfig);
});
