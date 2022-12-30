import * as fs from "fs";
import { parse } from "csv-parse";
import { configs } from "../config";
const { PROCESS_FILE_NAME } = configs;

const csvPromise = new Promise((resolve, reject) => {
  fs.readFile(`./process-files/${PROCESS_FILE_NAME}`, (err, fileData) => {
    parse(fileData, {}, function (err, rows) {
      resolve(rows);
    });
  });
});
async function readProcess() {
  return await csvPromise;
}

export { readProcess };
