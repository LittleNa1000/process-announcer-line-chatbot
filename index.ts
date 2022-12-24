import * as line from "@line/bot-sdk";
import * as express from "express";
import * as dotenv from "dotenv";
import { handleEvent } from "./src/handleEvent";
import { initAnnouncer } from "./src/announcer";
import { initClient } from "./src/client";
import { constants } from "./src/constants";
import * as readline from "readline";
import axios from "axios";
const readlineInterface = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
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
const config = {
  headers: {
    Authorization: `Bearer ${
      env!.NODE_ENV === "development"
        ? env!.ACCESS_TOKEN_DEMO
        : env!.ACCESS_TOKEN
    }`,
  },
};
const client = new line.Client(lineConfig);
function validURL(str: string) {
  const pattern = new RegExp(
    "^(https?:\\/\\/)?" +
      "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" +
      "((\\d{1,3}\\.){3}\\d{1,3}))" +
      "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" +
      "(\\?[;&a-z\\d%_.~+=-]*)?" +
      "(\\#[-a-z\\d_]*)?$",
    "i"
  );
  return !!pattern.test(str);
}

app.post("/webhook", line.middleware(lineConfig), async (req, res) => {
  try {
    const events = req.body.events;
    console.log(req.body.events);
    return events.length > 0
      ? await events.map((item) => handleEvent(item))
      : res.status(200).send("OK");
  } catch (err) {
    console.log(err);
    res.status(500).end();
  }
});

app.listen(env!.PORT, async () => {
  console.log(`On port ${env!.PORT}`);
  initClient(client);
  await initAnnouncer();
  console.log(
    `process: ${PROCESS_FILE_NAME}, NODE_ENV: ${
      env!.NODE_ENV
    }, Allow push messages: ${env!.ALLOW_PUSH_MESSAGE}`
  );
  readlineInterface.question(
    "Set webhook endpoint URL (optional): ",
    async function (webhookURL) {
      if (validURL(webhookURL))
        await axios
          .put(
            `https://api.line.me/v2/bot/channel/webhook/endpoint`,
            { endpoint: webhookURL + "/webhook" },
            config
          )
          .then((res) => {
            console.log(
              `Set webhook endpoint URL: ${
                res && res.status == 200 ? "Success" : "Failed"
              }`
            );
          })
          .catch((err) => {
            console.log(err);
          });
      await axios
        .post(`https://api.line.me/v2/bot/channel/webhook/test`, {}, config)
        .then((res) => {
          console.log(
            `Test webhook endpoint URL: ${
              res &&
              res.status == 200 &&
              res.data.success &&
              res.data.statusCode == 200
                ? "Success"
                : "Failed"
            }`
          );
        })
        .catch((err) => {
          console.log(err);
        });
      readlineInterface.close();
    }
  );
});
