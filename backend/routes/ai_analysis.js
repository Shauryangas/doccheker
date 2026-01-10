import express from "express";
import fs from "fs";
import path from "path";
import { visionArtifactAgent } from "../controller/visionArtifactAgent.js";
import { calculateVisionScore } from "../utils/calculatescore.js";
import Document from "../models/Document.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// All routes protected
router.use(protect);

// @route   POST /api/ai/analyze/:documentId
// @desc    Analyze image with Vision Artifact Agent
// @access  Private
router.post("/analyze/:documentId", async (req, res) => {
  try {
    const { documentId } = req.params;

    console.log(`🔍 Starting AI analysis for document: ${documentId}`);

    // Fetch document from database
    const document = await Document.findById(documentId);

    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found",
      });
    }

    // Verify document is an image
    if (document.evidence_type !== "image") {
      return res.status(400).json({
        success: false,
        error: "Only image evidence can be analyzed with Vision Artifact Agent",
      });
    }

    // Verify file exists on disk
    if (!fs.existsSync(document.file_path)) {
      console.error(`❌ File not found: ${document.file_path}`);
      return res.status(404).json({
        success: false,
        error: "Image file not found on server",
      });
    }

    console.log(`✓ Processing image: ${document.file_name}`);
    console.log(`✓ File path: ${document.file_path}`);

    // Log metadata status
    const hasMetadata =
      document.metadata && Object.keys(document.metadata).length > 0;
    console.log(
      `📊 Metadata status: ${
        hasMetadata
          ? `${Object.keys(document.metadata).length} fields found`
          : "No metadata present"
      }`
    );

    // Call Vision Artifact Agent with metadata
    const data = await visionArtifactAgent(
      document.file_path,
      document.metadata
    );

    // Calculate AI likelihood score
    const aiLikelihood = calculateVisionScore(data.findings);

    // Update document with analysis results including Hive verdict
    document.analysis_status = "analyzed";
    document.ai_analysis = {
      vision_artifact: {
        findings: data.findings,
        ai_likelihood: aiLikelihood,
        analyzed_at: new Date(),
        hive_verdict: data.hive_analysis || null, // Store Hive scores and verdict
      },
    };
    await document.save();

    console.log(`✅ Analysis complete for ${document.file_name}`);
    console.log(`📊 AI Likelihood: ${aiLikelihood}`);
    console.log(`🔍 Findings: ${data.findings.length} issues detected`);
    if (data.hive_analysis) {
      console.log(
        `🔬 Hive Conclusion: ${data.hive_analysis.verdict} (${data.hive_analysis.confidence}%)`
      );
    }

    res.json({
      success: true,
      agent: "vision_artifact",
      document_id: documentId,
      findings: data.findings,
      ai_likelihood: aiLikelihood,
      hive_verdict: data.hive_analysis, // Include Hive data in response
      analyzed_at: new Date(),
    });
  } catch (err) {
    console.error("❌ AI Analysis Error:", err.message);

    // Handle specific error types
    if (err.message.includes("timeout")) {
      return res.status(504).json({
        success: false,
        error: "AI analysis timed out. Please try again.",
        details: err.message,
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to analyze image",
      details: process.env.NODE_ENV !== "production" ? err.message : undefined,
    });
  }
});

export default router;
