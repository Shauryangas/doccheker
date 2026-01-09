import { geminiVisionModel } from "../lib/geminiclient.js";
import { imageToBase64 } from "../lib/pathto64.js";
import { visionArtifactPrompt } from "../prompts/visionmodel.js";
import { VisionArtifactSchema } from "../schema/visionartifactschema.js";

export const visionArtifactAgent = async (imagepath) => {
  try {
    // Convert image to base64
    const base64Image = imageToBase64(imagepath);

    // Call Gemini Vision API with timeout handling
    const result = await Promise.race([
      geminiVisionModel.generateContent([
        {
          text: visionArtifactPrompt,
        },
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: base64Image,
          },
        },
      ]),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Gemini API timeout (30s)")), 30000)
      ),
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

    return parsed.data;
  } catch (error) {
    console.error("❌ Vision Artifact Agent Error:", error.message);
    throw error;
  }
};
