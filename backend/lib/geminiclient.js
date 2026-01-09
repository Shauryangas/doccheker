import { GoogleGenerativeAI } from "@google/generative-ai";

// Debug: Verify API key is loaded (showing only first/last chars for security)
const apiKey ="AIzaSyCIXdK_52m4z0enAKWEKUzc2Cf9fSA6N78";
if (apiKey) {
  console.log(
    `✓ GEMINI_API_KEY loaded: ${apiKey.substring(0, 8)}...${apiKey.substring(
      apiKey.length - 4
    )} (length: ${apiKey.length})`
  );
} else {
  console.error("❌ GEMINI_API_KEY is not set!");
}

const genAI = new GoogleGenerativeAI(apiKey);

export const geminiVisionModel = genAI.getGenerativeModel({
  model: "gemini-2.5-flash", // Use 1.5-flash for free tier compatibility
});
