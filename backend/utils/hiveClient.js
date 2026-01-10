import OpenAI from "openai";
import fs from "fs";

console.log("hive", process.env.HIVE_API_KEY);

// Initialize Hive OpenAI-compatible client
const hiveClient = new OpenAI({
  baseURL: "https://api.thehive.ai/api/v3/",
  apiKey: process.env.HIVE_API_KEY,
  timeout: 120000, // 2 minutes - Hive VLM can take longer for complex analysis
  maxRetries: 2, // Retry on network errors
});

/**
 * Call Hive AI's Vision Language Model (VLM) - Free Tier Compatible
 * Uses OpenAI SDK with Hive's OpenAI-compatible API
 * @param {string} imagePath - Absolute path to image file
 * @returns {Promise<Object>} Hive VLM response with AI detection analysis
 */
export const analyzeWithHive = async (imagePath) => {
  try {
    console.log("🔬 Calling Hive VLM forensic analysis...");

    // Read image and convert to base64
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString("base64");

    // Determine MIME type based on file extension
    const ext = imagePath.toLowerCase().split(".").pop();
    const mimeTypeMap = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      webp: "image/webp",
    };
    const mimeType = mimeTypeMap[ext] || "image/jpeg";

    // Call Hive VLM using OpenAI SDK
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
1. **Artifacts**: Look for blurring, distortions, or unnatural patterns and logo or watermarks in the image
2. **Consistency**: Check lighting, shadows, and perspective consistency
3. **Details**: Examine fine details like text, hands, eyes, and textures
4. **Patterns**: Identify repetitive or symmetrical patterns unusual in real photos
5. **Overall Quality**: Assess if the image has characteristics typical of AI generation

Provide your analysis in the following JSON format:
{
  "verdict": "AI-GENERATED" or "REAL",
  "confidence": <number 0-100>,
  "ai_likelihood": <number 0-100>,
  "real_likelihood": <number 0-100>,
  "indicators": [
    { "type": "artifact/consistency/detail/pattern", "description": "brief description", "severity": "low/medium/high" }
  ],
  "reasoning": "brief explanation of your conclusion"
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
      temperature: 0.3, // Lower temperature for more consistent analysis
    });

    console.log("✅ Hive VLM analysis complete");
    return completion;
  } catch (error) {
    console.error("❌ Hive VLM Error:", error.message);
    if (error.response) {
      console.error("   Status:", error.response.status);
      console.error("   Data:", JSON.stringify(error.response.data));
    }

    // Return null on error to allow graceful fallback to Gemini-only
    return null;
  }
};

/**
 * Extract Hive VLM verdict from OpenAI SDK response
 * @param {Object} hiveResults - OpenAI SDK completion response
 * @returns {Object} Simplified verdict with AI and Real scores
 */
export const extractHiveVerdict = (hiveResults) => {
  if (!hiveResults || !hiveResults.choices || !hiveResults.choices[0]) {
    return { aiScore: 0, realScore: 0, verdict: "unavailable" };
  }

  try {
    const messageContent = hiveResults.choices[0].message?.content;
    if (!messageContent) {
      return { aiScore: 0, realScore: 0, verdict: "unavailable" };
    }

    // Try to parse JSON response
    let analysis;
    try {
      // Remove markdown code fences if present
      let cleanedContent = messageContent.trim();
      if (cleanedContent.startsWith("```")) {
        cleanedContent = cleanedContent.replace(/^```(?:json)?\s*/i, "");
        cleanedContent = cleanedContent.replace(/\s*```\s*$/, "");
      }
      analysis = JSON.parse(cleanedContent);
    } catch (parseError) {
      // If JSON parsing fails, try to extract information from text
      console.warn("⚠️  Could not parse VLM response as JSON, using fallback");

      // Simple text analysis fallback
      const lowerContent = messageContent.toLowerCase();
      const isAI =
        lowerContent.includes("ai-generated") ||
        lowerContent.includes("artificial");
      const isReal =
        lowerContent.includes("real") || lowerContent.includes("authentic");

      return {
        aiScore: isAI ? 70 : 30,
        realScore: isReal ? 70 : 30,
        verdict: isAI ? "AI-GENERATED" : "REAL",
        confidence: 50,
        reasoning: messageContent.substring(0, 200),
        raw_response: messageContent,
      };
    }

    // Extract values from parsed JSON
    const aiScore = analysis.ai_likelihood || 0;
    const realScore = analysis.real_likelihood || 100 - aiScore;
    const verdict =
      analysis.verdict || (aiScore > 50 ? "AI-GENERATED" : "REAL");
    const confidence = analysis.confidence || Math.max(aiScore, realScore);

    return {
      aiScore: parseFloat(aiScore.toFixed(2)),
      realScore: parseFloat(realScore.toFixed(2)),
      verdict,
      confidence: parseFloat(confidence.toFixed(2)),
      indicators: analysis.indicators || [],
      reasoning: analysis.reasoning || "",
      model: "hive-vlm",
    };
  } catch (error) {
    console.error("❌ Error extracting VLM verdict:", error.message);
    return { aiScore: 0, realScore: 0, verdict: "unavailable" };
  }
};
