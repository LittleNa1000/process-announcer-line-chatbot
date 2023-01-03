import * as fs from "fs";
const receiversPath = "./storage/receivers.json";
const backupShiftPath = "./storage/backupShift.json";
const plusProcessRecordsPath = "./storage/plusProcessRecords.json";
const counterPath = "./storage/counter.json";
function writeJSON(path: string, contents: object) {
  const jsonString = JSON.stringify(contents);
  fs.writeFileSync(path, jsonString);
}
function readJSON(path: string, defaultContents: object): any {
  if (fs.existsSync(path)) {
    const rawdata = fs.readFileSync(path);
    return JSON.parse(rawdata.toString());
  }
  writeJSON(path, defaultContents);
  return defaultContents;
}
function writeReceivers(receivers = []) {
  writeJSON(receiversPath, { receivers: receivers });
}
function readReceivers() {
  return readJSON(receiversPath, { receivers: [] });
}
function writeBackupShift(backupShift = []) {
  writeJSON(backupShiftPath, { backupShift: backupShift });
}
function readBackupShift() {
  return readJSON(backupShiftPath, { backupShift: [] });
}
function writePlusProcessRecords(records = [], blackList = {}) {
  writeJSON(plusProcessRecordsPath, { records: records, blackList: blackList });
}
function readPlusProcessRecords() {
  return readJSON(plusProcessRecordsPath, { records: [], blackList: {} });
}
function writeCounter(counter = {}) {
  writeJSON(counterPath, { counter: counter });
}
function readCounter() {
  return readJSON(counterPath, { counter: {} });
}
export {
  writeReceivers,
  readReceivers,
  writeBackupShift,
  readBackupShift,
  writePlusProcessRecords,
  readPlusProcessRecords,
  writeCounter,
  readCounter,
};
