const fs = require("fs");
const { parse } = require("csv-parse");

const csvPromise = new Promise((resolve, reject) => {
  fs.readFile("./resources/30-5-65.csv", (err, fileData) => {
    parse(fileData, {}, function (err, rows) {
      resolve(rows);
    });
  });
});
async function readProcess() {
  return await csvPromise;
}

module.exports = { readProcess };
