import * as fs from "fs";
const path = "./src/utils/receivers.json";

function writeJSON(receivers = []) {
  const jsonString = JSON.stringify({ receivers: receivers });
  fs.writeFileSync(path, jsonString);
}
function readJSON() {
  if (fs.existsSync(path)) {
    const rawdata = fs.readFileSync(path);
    const receivers = JSON.parse(rawdata.toString());
    return receivers;
  }
  writeJSON();
  return { receivers: [] };
}
export { writeJSON, readJSON };
