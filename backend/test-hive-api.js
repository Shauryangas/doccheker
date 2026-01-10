import OpenAI from "openai";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

console.log("🧪 Testing Hive Vision Language Model API\n");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

// Check environment variables
console.log("1. Environment Variables:");
console.log(
  `   HIVE_API_KEY: ${
    process.env.HIVE_API_KEY
      ? "✓ Set (" + process.env.HIVE_API_KEY.substring(0, 8) + "...)"
      : "✗ Not set"
  }`
);

if (!process.env.HIVE_API_KEY) {
  console.log("\n❌ HIVE_API_KEY is not set in .env file!");
  process.exit(1);
}

// Initialize Hive client
const hiveClient = new OpenAI({
  baseURL: "https://api.thehive.ai/api/v3/",
  apiKey: process.env.HIVE_API_KEY,
});

console.log("\n2. Testing Hive VLM API:");
console.log("   Endpoint: https://api.thehive.ai/api/v3/chat/completions");
console.log("   Model: hive/vision-language-model");

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

// Test Hive VLM
async function testHiveVLM() {
  try {
    console.log("\n3. Calling Hive VLM for AI Detection:\n");

    // Read and encode image
    const imageBuffer = fs.readFileSync(testImage);
    const base64Image = imageBuffer.toString("base64");

    const ext = testImage.toLowerCase().split(".").pop();
    const mimeTypeMap = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
    };
    const mimeType = mimeTypeMap[ext] || "image/jpeg";

    const completion = await hiveClient.chat.completions.create({
      model: "hive/vision-language-model",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this image to determine if it is AI-generated or a real photograph. 

Please examine the following indicators:
1. **Artifacts**: Look for blurring, distortions, or unnatural patterns and logo or watermarks
2. **Consistency**: Check lighting, shadows, and perspective consistency
3. **Details**: Examine fine details like text, hands, eyes, and textures

Provide your analysis in the following JSON format:
{
  "verdict": "AI-GENERATED" or "REAL",
  "confidence": <number 0-100>,
  "ai_likelihood": <number 0-100>,
  "real_likelihood": <number 0-100>,
  "reasoning": "brief explanation"
}`,
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      max_tokens: 1000,
      temperature: 0.3,
    });

    console.log("   ✅ SUCCESS!\n");
    console.log("   VLM Analysis:");
    console.log("   " + "─".repeat(50));

    const content = completion.choices[0]?.message?.content;
    if (content) {
      console.log(content);

      // Try to parse as JSON
      try {
        let cleanedContent = content.trim();
        if (cleanedContent.startsWith("```")) {
          cleanedContent = cleanedContent.replace(/^```(?:json)?\s*/i, "");
          cleanedContent = cleanedContent.replace(/\s*```\s*$/, "");
        }
        const parsed = JSON.parse(cleanedContent);
        console.log("\n   📊 Parsed Results:");
        console.log(`   Verdict: ${parsed.verdict}`);
        console.log(`   Confidence: ${parsed.confidence}%`);
        console.log(`   AI Likelihood: ${parsed.ai_likelihood}%`);
        console.log(`   Real Likelihood: ${parsed.real_likelihood}%`);
      } catch (e) {
        console.log("\n   ℹ️  Response is plain text (not JSON)");
      }
    }

    console.log("\n   " + "─".repeat(50));
    console.log("\n   Usage:");
    console.log(`   Tokens: ${completion.usage?.total_tokens || "N/A"}`);

    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✅ Hive VLM is working correctly!");
    return true;
  } catch (error) {
    console.log("   ❌ FAILED\n");
    console.log("   Error:", error.message);
    if (error.status) {
      console.log("   Status:", error.status);
    }
    if (error.response) {
      console.log("   Response:", JSON.stringify(error.response.data, null, 2));
    }

    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("❌ Hive VLM test failed!");
    console.log("\nPossible issues:");
    console.log("1. Invalid API key - verify at https://thehive.ai");
    console.log("2. Free tier credits exhausted");
    console.log("3. VLM not available on your plan");
    console.log("4. Need to generate V3 API key (not V2)");
    console.log(
      "\n💡 Recommendation: Check your Hive dashboard for API key type"
    );
    return false;
  }
}

testHiveVLM();
