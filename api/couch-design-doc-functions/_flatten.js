// read file from argument
import * as fs from "fs";
let file = process.argv[2];
const fileData = fs.readFileSync(file).toString();
console.log(
  JSON.stringify(
    fileData.replace("REMOVE_FUNC_NAME_BEFORE_INSERTING_IN_COUCH", "")
  )
);
