import dotenv from "dotenv";
import {
  analyzeWithSightEngine,
  extractSightEngineVerdict,
} from "./utils/sightengineClient.js";
import fs from "fs";

dotenv.config();

console.log("🧪 Testing SightEngine AI Detection API\n");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

// Check environment variables
console.log("1. Environment Variables:");
console.log(
  `   SIGHTENGINE_API_USER: ${
    process.env.SIGHTENGINE_API_USER
      ? "✓ Set (" + process.env.SIGHTENGINE_API_USER + ")"
      : "✗ Not set"
  }`
);
console.log(
  `   SIGHTENGINE_API_SECRET: ${
    process.env.SIGHTENGINE_API_SECRET ? "✓ Set" : "✗ Not set"
  }`
);

if (!process.env.SIGHTENGINE_API_USER || !process.env.SIGHTENGINE_API_SECRET) {
  console.log("\n❌ SightEngine credentials not set in .env file!");
  console.log("\nTo get your credentials:");
  console.log("1. Sign up at https://sightengine.com");
  console.log("2. Get your API User and API Secret from the dashboard");
  console.log("3. Add to .env:");
  console.log("   SIGHTENGINE_API_USER=your_api_user");
  console.log("   SIGHTENGINE_API_SECRET=your_api_secret");
  process.exit(1);
}

console.log("\n2. Testing SightEngine API:");
console.log("   Endpoint: https://api.sightengine.com/1.0/check.json");
console.log("   Model: genai (AI-generated detection)");

// Find a test image
const testImagePath = "uploads/images";
let testImage = null;

if (fs.existsSync(testImagePath)) {
  const files = fs
    .readdirSync(testImagePath)
    .filter((f) => f.endsWith(".png") || f.endsWith(".jpg"));
  if (files.length > 0) {
    testImage = `${testImagePath}/${files[0]}`;
    console.log(`   Test Image: ${files[0]}`);
  }
}

if (!testImage) {
  console.log("\n⚠️  No test image found in uploads/images/");
  console.log("   Upload an image first, then run this test again.\n");
  process.exit(0);
}

// Test SightEngine
async function testSightEngine() {
  try {
    console.log("\n3. Calling SightEngine AI Detection:\n");

    const result = await analyzeWithSightEngine(testImage);

    if (result) {
      console.log("   ✅ SUCCESS!\n");
      console.log("   Full Response:");
      console.log("   " + "─".repeat(50));
      console.log(JSON.stringify(result, null, 2));
      console.log("   " + "─".repeat(50));

      console.log("\n   📊 Extracted Verdict:");
      const verdict = extractSightEngineVerdict(result);
      console.log(`   Verdict: ${verdict.verdict}`);
      console.log(`   Confidence: ${verdict.confidence}%`);
      console.log(`   AI Score: ${verdict.aiScore}%`);
      console.log(`   Real Score: ${verdict.realScore}%`);
      console.log(`   AI Class: ${verdict.ai_class}`);

      console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("✅ SightEngine is working correctly!");
      console.log(
        `\n💡 Free tier: ${
          2000 - (result.request?.operations || 0)
        } operations remaining this month`
      );
      return true;
    } else {
      console.log("\n❌ No result from SightEngine");
      return false;
    }
  } catch (error) {
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("❌ SightEngine test failed!");
    console.log("\nError:", error.message);
    console.log("\nPossible issues:");
    console.log(
      "1. Invalid API credentials - verify at https://sightengine.com"
    );
    console.log("2. Free tier credits exhausted (2000/month limit)");
    console.log("3. Network connectivity issues");
    console.log("4. Image file format not supported");
    return false;
  }
}

testSightEngine();
