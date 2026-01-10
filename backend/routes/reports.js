import express from "express";
import { protect } from "../middleware/auth.js";
import Document from "../models/Document.js";
import { generateForensicReport } from "../utils/pdfGenerator.js";

const router = express.Router();

// All routes protected
router.use(protect);

/**
 * @route   POST /api/reports/generate/:documentId
 * @desc    Generate Expert Forensic Report PDF
 * @access  Private
 */
router.post("/generate/:documentId", async (req, res) => {
  try {
    const { documentId } = req.params;
    const { caseTitle, caseNumber, expertName, additionalNotes } = req.body;

    console.log(`📄 Generating forensic report for document: ${documentId}`);

    // Fetch document from database
    const document = await Document.findById(documentId);

    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found",
      });
    }

    // Verify document has been analyzed
    if (document.analysis_status !== "analyzed" || !document.ai_analysis) {
      return res.status(400).json({
        success: false,
        error:
          "Document has not been analyzed yet. Please analyze the evidence first.",
      });
    }

    // Prepare case information
    const caseInfo = {
      caseTitle: caseTitle || "N/A",
      caseNumber: caseNumber || document._id.toString(),
      expertName: expertName || "AI Forensic Analysis System",
      additionalNotes: additionalNotes || "",
    };

    // Set response headers for PDF download
    const filename = `forensic-report-${document.file_name.replace(
      /\.[^/.]+$/,
      ""
    )}-${Date.now()}.pdf`;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    // Generate and stream PDF
    console.log(`✓ Generating PDF report...`);
    generateForensicReport(document, caseInfo, res);

    console.log(`✅ Forensic report generated successfully: ${filename}`);
  } catch (error) {
    console.error("❌ Error generating forensic report:", error.message);
    console.error(error.stack);

    // Check if headers haven't been sent yet
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: "Failed to generate forensic report",
        details:
          process.env.NODE_ENV !== "production" ? error.message : undefined,
      });
    }
  }
});

export default router;
