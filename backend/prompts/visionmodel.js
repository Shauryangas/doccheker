/**
 * Build dynamic vision analysis prompt with SightEngine AI detection data and metadata
 * @param {Object} sightEngineResults - Raw SightEngine API response
 * @param {Object} metadata - Image EXIF metadata
 * @returns {string} Complete prompt for Gemini
 */
export const buildVisionPrompt = (sightEngineResults, metadata) => {
  const basePrompt = `You are a Senior Computer Vision Forensic Analyst.

IMPORTANT: You are the FINAL ANALYST. Your job is to synthesize technical data with visual analysis.

${buildSightEngineContext(sightEngineResults)}

${buildMetadataContext(metadata)}

Your Task:
- Review the SightEngine AI Detection technical data as your SOURCE OF TRUTH
- Perform your own visual analysis to find supporting/contradicting evidence
- Provide a final comprehensive verdict combining both analyses

Rules:
- Use SightEngine's technical verdict as the primary indicator
- Report visual inconsistencies that support or contradict SightEngine's findings
- If SightEngine says AI-generated, find visual artifacts that explain WHY
- If SightEngine says real, note any concerning visual elements
- Be conservative. If unsure, defer to technical data.
- Output ONLY valid JSON.

JSON Schema:
{
  "findings": [ 
    {
      "category": "anatomy | lighting | texture | text | object | metadata | technical",
      "issue": "short_issue_name",
      "description": "clear human-readable description",
      "severity": "low | medium | high"
    }
  ]
}

Focus on:
- Hands and fingers (common AI failure points)
- Face symmetry, eyes, teeth
- Glasses, jewelry, reflective surfaces
- Lighting and shadow consistency
- Text coherence and readability
- Background inconsistencies
- Edge artifacts and blending issues
`;

  return basePrompt;
};

/**
 * Build SightEngine AI detection context for prompt
 * @param {Object} sightEngineResults - Raw SightEngine API response
 * @returns {string} Formatted SightEngine context
 */
function buildSightEngineContext(sightEngineResults) {
  if (!sightEngineResults || sightEngineResults.status !== "success") {
    return `\n⚠️ SIGHTENGINE AI DETECTION: Technical analysis unavailable. Proceed with visual analysis only.`;
  }

  // SightEngine returns data in 'type' field
  const typeData = sightEngineResults.type;
  if (!typeData || typeData.ai_generated === undefined) {
    return `\n⚠️ SIGHTENGINE AI DETECTION: No classification data available.`;
  }

  const aiScore = (typeData.ai_generated || 0) * 100;
  const realScore = 100 - aiScore;
  const verdict = aiScore > 50 ? "AI-GENERATED" : "REAL PHOTO";
  const confidence = Math.max(aiScore, realScore);

  return `
🔬 SIGHTENGINE AI DETECTION TECHNICAL ANALYSIS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Model: AI-Generated Image Detection (Specialized AI Detector)
✓ Verdict: ${verdict}
✓ Confidence: ${confidence.toFixed(1)}%

Detailed Breakdown:
- AI Generated Probability: ${aiScore.toFixed(1)}%
- Real Photo Probability: ${realScore.toFixed(1)}%

⚠️ CRITICAL: Use this technical verdict as your PRIMARY REFERENCE.
Your visual analysis should explain WHY this technical verdict makes sense based on what you see in the image.
`;
}

/**
 * Build metadata context for prompt
 * @param {Object} metadata - Image EXIF metadata
 * @returns {string} Formatted metadata context
 */
function buildMetadataContext(metadata) {
  const hasMetadata = metadata && Object.keys(metadata).length > 0;

  if (!hasMetadata) {
    return `\n\n⚠️ METADATA ALERT: This image has NO EXIF metadata. This is highly suspicious and could indicate:
- The image was edited or processed through software that strips metadata
- The image was AI-generated (AI-generated images typically lack camera metadata)
- The image was deliberately sanitized to hide its origin
Please consider this as a potential red flag in your analysis.`;
  }

  // Build metadata summary
  let context = `\n\n📊 IMAGE METADATA INFORMATION:`;

  if (metadata.Make || metadata.Model) {
    context += `\n- Camera: ${metadata.Make || ""} ${
      metadata.Model || ""
    }`.trim();
  }

  if (metadata.DateTimeOriginal) {
    context += `\n- Date Taken: ${metadata.DateTimeOriginal}`;
  }

  if (metadata.Software) {
    context += `\n- Software: ${metadata.Software}`;
    context += `\n  ⚠️ NOTE: Software field present - image may have been edited`;
  }

  if (metadata.GPSLatitude && metadata.GPSLongitude) {
    context += `\n- GPS Location: ${metadata.GPSLatitude}, ${metadata.GPSLongitude}`;
  }

  context += `\n\nConsider this metadata in your analysis. Presence of editing software or absence of expected metadata may indicate tampering.`;

  return context;
}

// Keep original static prompt for backward compatibility (if needed elsewhere)
export const visionArtifactPrompt = buildVisionPrompt(null, {});
