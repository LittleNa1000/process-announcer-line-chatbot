import * as fs from "fs";
const receiversPath = "./storage/receivers.json";
const backupShiftPath = "./storage/backupShift.json";

function writeReceivers(receivers = []) {
  const jsonString = JSON.stringify({ receivers: receivers });
  fs.writeFileSync(receiversPath, jsonString);
}
function readReceivers() {
  if (fs.existsSync(receiversPath)) {
    const rawdata = fs.readFileSync(receiversPath);
    const receivers = JSON.parse(rawdata.toString());
    return receivers;
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
    const backupShift = JSON.parse(rawdata.toString());
    return backupShift;
  }
  writeBackupShift();
  return { backupShift: [] };
}
export { writeReceivers, readReceivers, writeBackupShift, readBackupShift };
