import dotenv from "dotenv";
import fs from "fs";
dotenv.config();

const key = process.env.GEMINI_API_KEY;
const output = `Length: ${key ? key.length : 0}\nValue: ${key}\nHas newlines: ${
  key ? key.includes("\n") : "N/A"
}\nHas carriage returns: ${key ? key.includes("\r") : "N/A"}`;

fs.writeFileSync("env-debug.txt", output);
console.log(output);
