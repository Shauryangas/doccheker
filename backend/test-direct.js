import { analyzeWithHive, extractHiveVerdict } from "./utils/hiveClient.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("Testing Hive VLM integration...\n");

// Find a test image
const testImagePath = path.join(__dirname, "uploads", "images");
let testImage = null;

if (fs.existsSync(testImagePath)) {
  const files = fs
    .readdirSync(testImagePath)
    .filter((f) => f.endsWith(".png") || f.endsWith(".jpg"));
  if (files.length > 0) {
    testImage = path.join(testImagePath, files[0]);
    console.log(`Test Image: ${files[0]}\n`);
  }
}

if (!testImage) {
  console.log("No test image found!");
  process.exit(1);
}

try {
  const result = await analyzeWithHive(testImage);

  if (result) {
    console.log("\n✅ Hive VLM Response:");
    console.log(JSON.stringify(result, null, 2));

    console.log("\n📊 Extracted Verdict:");
    const verdict = extractHiveVerdict(result);
    console.log(JSON.stringify(verdict, null, 2));
  } else {
    console.log("\n❌ No result from Hive VLM");
  }
} catch (error) {
  console.error("\n❌ Error:", error.message);
  console.error(error.stack);
}
