import axios from "axios";
import FormData from "form-data";
import fs from "fs";

console.log("sightengine user:", process.env.SIGHTENGINE_API_USER);
console.log(
  "sightengine secret:",
  process.env.SIGHTENGINE_API_SECRET ? "Set" : "Not set"
);

const SIGHTENGINE_API_URL = "https://api.sightengine.com/1.0/check.json";

/**
 * Analyze image with SightEngine AI-Generated Detection
 * Free tier: 2000 operations/month
 * @param {string} imagePath - Absolute path to image file
 * @returns {Promise<Object>} SightEngine API response
 */
export const analyzeWithSightEngine = async (imagePath) => {
  try {
    console.log("🔬 Calling SightEngine AI Detection...");

    if (
      !process.env.SIGHTENGINE_API_USER ||
      !process.env.SIGHTENGINE_API_SECRET
    ) {
      console.error("❌ SightEngine credentials not configured");
      return null;
    }

    // Create form data with image
    const formData = new FormData();
    formData.append("media", fs.createReadStream(imagePath));
    formData.append("models", "genai"); // AI-generated detection model
    formData.append("api_user", process.env.SIGHTENGINE_API_USER);
    formData.append("api_secret", process.env.SIGHTENGINE_API_SECRET);

    const response = await axios.post(SIGHTENGINE_API_URL, formData, {
      headers: {
        ...formData.getHeaders(),
      },
      timeout: 30000, // 30 second timeout
    });

    console.log("✅ SightEngine analysis complete");
    console.log(
      "📊 SightEngine Response:",
      JSON.stringify(response.data, null, 2)
    );
    return response.data;
  } catch (error) {
    console.error("❌ SightEngine Error:", error.message);
    if (error.response) {
      console.error("   Status:", error.response.status);
      console.error("   Data:", JSON.stringify(error.response.data));
    }

    // Return null on error to allow graceful fallback to Gemini-only
    return null;
  }
};

/**
 * Extract verdict from SightEngine API response
 * @param {Object} results - Raw SightEngine API response
 * @returns {Object} Simplified verdict with AI and Real scores
 */
export const extractSightEngineVerdict = (results) => {
  // SightEngine returns the score in 'type' field, not 'genai'
  if (!results || results.status !== "success" || !results.type) {
    console.warn("⚠️  Invalid SightEngine response format:", results);
    return { aiScore: 0, realScore: 0, verdict: "unavailable" };
  }

  try {
    // SightEngine returns ai_generated score from 0 to 1
    const aiScore = (results.type.ai_generated || 0) * 100;
    const realScore = 100 - aiScore;
    const verdict = aiScore > 50 ? "AI-GENERATED" : "REAL";

    return {
      aiScore: parseFloat(aiScore.toFixed(2)),
      realScore: parseFloat(realScore.toFixed(2)),
      verdict,
      confidence: parseFloat(Math.max(aiScore, realScore).toFixed(2)),
      model: "sightengine",
    };
  } catch (error) {
    console.error("❌ Error extracting SightEngine verdict:", error.message);
    return { aiScore: 0, realScore: 0, verdict: "unavailable" };
  }
};
