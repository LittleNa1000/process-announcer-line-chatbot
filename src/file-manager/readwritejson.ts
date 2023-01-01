import * as fs from "fs";
const receiversPath = "./storage/receivers.json";
const backupShiftPath = "./storage/backupShift.json";
const plusProcessRecordsPath = "./storage/plusProcessRecords.json";

function writeReceivers(receivers = []) {
  const jsonString = JSON.stringify({ receivers: receivers });
  fs.writeFileSync(receiversPath, jsonString);
}
function readReceivers() {
  if (fs.existsSync(receiversPath)) {
    const rawdata = fs.readFileSync(receiversPath);
    const contents = JSON.parse(rawdata.toString());
    return contents;
  }
  writeReceivers();
  return { receivers: [] };
}
function writeBackupShift(backupShift = []) {
  const jsonString = JSON.stringify({ backupShift: backupShift });
  fs.writeFileSync(backupShiftPath, jsonString);
}
function readBackupShift() {
  if (fs.existsSync(backupShiftPath)) {
    const rawdata = fs.readFileSync(backupShiftPath);
    const contents = JSON.parse(rawdata.toString());
    return contents;
  }
  writeBackupShift();
  return { backupShift: [] };
}
function writePlusProcessRecords(records = [], blackList = {}) {
  const jsonString = JSON.stringify({ records: records, blackList: blackList });
  fs.writeFileSync(plusProcessRecordsPath, jsonString);
}
function readPlusProcessRecords() {
  if (fs.existsSync(plusProcessRecordsPath)) {
    const rawdata = fs.readFileSync(plusProcessRecordsPath);
    const contents = JSON.parse(rawdata.toString());
    return contents;
  }
  writePlusProcessRecords();
  return { records: [], blackList: {} };
}
export {
  writeReceivers,
  readReceivers,
  writeBackupShift,
  readBackupShift,
  writePlusProcessRecords,
  readPlusProcessRecords,
};
