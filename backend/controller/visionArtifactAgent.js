import { geminiVisionModel } from "../utils/geminiclient.js";
import { imageToBase64 } from "../utils/pathto64.js";
import { buildVisionPrompt } from "../prompts/visionmodel.js";
import { VisionArtifactSchema } from "../schema/visionartifactschema.js";
import {
  analyzeWithSightEngine,
  extractSightEngineVerdict,
} from "../utils/sightengineClient.js";

/**
 * Vision Artifact Agent - Enhanced with SightEngine AI Detection
 * Pipeline: SightEngine AI → Gemini Vision → Synthesized Analysis
 *
 * @param {string} imagepath - Absolute path to image file
 * @param {Object} metadata - Image EXIF metadata
 * @returns {Promise<Object>} Analysis findings with SightEngine verdict
 */
export const visionArtifactAgent = async (imagepath, metadata = {}) => {
  try {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(
      "🔬 Starting Enhanced AI Detection Pipeline (SightEngine + Gemini)"
    );
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    // STEP 1: SightEngine AI Detection (Free Tier - 2000/month)
    console.log("🔬 Phase 1: SightEngine AI Detection...");
    const sightEngineResults = await analyzeWithSightEngine(imagepath);

    let sightEngineVerdict = null;
    if (sightEngineResults) {
      sightEngineVerdict = extractSightEngineVerdict(sightEngineResults);
      console.log(
        `✅ SightEngine Verdict: ${sightEngineVerdict.verdict} (${sightEngineVerdict.confidence}% confidence)`
      );
      console.log(`   - AI Generated: ${sightEngineVerdict.aiScore}%`);
      console.log(`   - Real Photo: ${sightEngineVerdict.realScore}%`);
    } else {
      console.log(
        "⚠️  SightEngine analysis unavailable - proceeding with Gemini only"
      );
    }
    // STEP 2: Convert image to base64 for Gemini
    console.log("🖼️  Phase 2: Preparing image for Gemini...");
    const base64Image = imageToBase64(imagepath);

    // STEP 3: Build enhanced prompt with SightEngine data and metadata
    console.log("📝 Phase 3: Building comprehensive prompt...");
    const completePrompt = buildVisionPrompt(sightEngineResults, metadata);

    // STEP 4: Call Gemini Vision API with SightEngine context
    console.log("🤖 Phase 4: Gemini synthesis and visual analysis...");
    const result = await geminiVisionModel.generateContent([
      {
        text: completePrompt,
      },
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Image,
        },
      },
    ]);

    const responseText = result.response.text();

    // Log raw response in development
    if (process.env.NODE_ENV !== "production") {
      console.log("🤖 Gemini Raw Response:", responseText);
    }

    // Strip markdown code fences if present (Gemini sometimes wraps JSON in ```json ... ```)
    let cleanedResponse = responseText.trim();
    if (cleanedResponse.startsWith("```")) {
      // Remove opening code fence (```json or ```)
      cleanedResponse = cleanedResponse.replace(/^```(?:json)?\s*/i, "");
      // Remove closing code fence
      cleanedResponse = cleanedResponse.replace(/\s*```\s*$/, "");
    }

    // Parse and validate JSON response
    let jsonResponse;
    try {
      jsonResponse = JSON.parse(cleanedResponse);
    } catch (parseError) {
      throw new Error(
        `Failed to parse Gemini response as JSON: ${parseError.message}`
      );
    }

    const parsed = VisionArtifactSchema.safeParse(jsonResponse);

    if (!parsed.success) {
      console.error("❌ Schema validation failed:", parsed.error);
      throw new Error(
        `Invalid Gemini response format: ${parsed.error.message}`
      );
    }

    console.log(
      `✅ Analysis complete! Found ${parsed.data.findings.length} findings`
    );
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    // STEP 5: Return synthesized results with SightEngine data
    return {
      ...parsed.data,
      sightengine_analysis: sightEngineVerdict,
    };
  } catch (error) {
    console.error("❌ Vision Artifact Agent Error:", error.message);
    throw error;
  }
};
