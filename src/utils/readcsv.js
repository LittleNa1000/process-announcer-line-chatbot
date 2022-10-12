const fs = require("fs");
const { parse } = require("csv-parse");
const { PROCESS_FILE_NAME } = require("../constants");

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

module.exports = { readProcess };
