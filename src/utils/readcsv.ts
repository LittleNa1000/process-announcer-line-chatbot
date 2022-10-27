import * as fs from "fs";
import { parse } from "csv-parse";
import { constants } from "../constants";
const { PROCESS_FILE_NAME } = constants;

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
