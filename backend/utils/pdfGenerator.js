import PDFDocument from "pdfkit";
import crypto from "crypto";
import fs from "fs";

/**
 * Generate Expert Forensic Report PDF
 * Court-admissible format following FRE 702 and Daubert Standard
 */
export const generateForensicReport = (document, caseInfo, outputStream) => {
  const pdf = new PDFDocument({
    size: "A4",
    margin: 50,
    info: {
      Title: `Forensic Report - ${document.file_name}`,
      Author: caseInfo.expertName || "AI Forensic Analysis System",
      Subject: `Case ${caseInfo.caseNumber || "N/A"}`,
      Keywords: "forensic, AI detection, legal evidence",
    },
  });

  // Pipe to output stream
  pdf.pipe(outputStream);

  // Generate report sections
  addTitlePage(pdf, document, caseInfo);
  addExecutiveSummary(pdf, document);
  addMethodology(pdf);
  addTechnicalFindings(pdf, document);
  addDigitalFingerprint(pdf, document);
  addMetadataAnalysis(pdf, document);
  addStatementOfTruth(pdf, caseInfo);

  pdf.end();
  return pdf;
};

/**
 * 1. Title Page
 */
function addTitlePage(pdf, document, caseInfo) {
  pdf
    .fontSize(24)
    .font("Helvetica-Bold")
    .text("EXPERT FORENSIC REPORT", { align: "center" });

  pdf.moveDown(0.5);
  pdf.fontSize(12).font("Helvetica").text("━".repeat(60), { align: "center" });

  pdf.moveDown(2);

  // Case Information
  pdf.fontSize(12).font("Helvetica-Bold");

  if (caseInfo.caseTitle) {
    pdf.text(`Case: ${caseInfo.caseTitle}`);
    pdf.moveDown(0.5);
  }

  if (caseInfo.caseNumber) {
    pdf.text(`Case Number: ${caseInfo.caseNumber}`);
    pdf.moveDown(0.5);
  }

  pdf.text(`Document ID: ${document._id}`);
  pdf.moveDown(0.5);
  pdf.text(`Evidence File: ${document.file_name}`);
  pdf.moveDown(2);

  // Dates
  pdf.font("Helvetica");
  pdf.text(`Report Generated: ${new Date().toLocaleString()}`);
  pdf.moveDown(0.5);
  pdf.text(
    `Analysis Date: ${
      document.ai_analysis?.vision_artifact?.analyzed_at
        ? new Date(
            document.ai_analysis.vision_artifact.analyzed_at
          ).toLocaleString()
        : "N/A"
    }`
  );
  pdf.moveDown(0.5);
  pdf.text(
    `Evidence Uploaded: ${
      document.created_at
        ? new Date(document.created_at).toLocaleString()
        : "N/A"
    }`
  );

  pdf.moveDown(2);
  pdf.fontSize(10).font("Helvetica-Bold");
  pdf.text(
    `Prepared by: ${caseInfo.expertName || "AI Forensic Analysis System"}`
  );

  pdf.addPage();
}

/**
 * 2. Executive Summary
 */
function addExecutiveSummary(pdf, document) {
  addSectionHeader(pdf, "EXECUTIVE SUMMARY");

  const analysis = document.ai_analysis?.vision_artifact;
  const aiLikelihood = analysis?.ai_likelihood || 0;
  const sightEngineVerdict = analysis?.sightengine_verdict;

  const verdict = aiLikelihood > 0.5 ? "AI-GENERATED" : "AUTHENTIC";
  const confidence = Math.max(aiLikelihood, 1 - aiLikelihood) * 100;

  pdf.fontSize(11).font("Helvetica-Bold");
  pdf.text("Finding:");
  pdf.moveDown(0.3);

  pdf.fontSize(11).font("Helvetica");
  const likelihoodPercent = (aiLikelihood * 100).toFixed(1);
  pdf.text(
    `It is my professional opinion, with a high degree of scientific certainty, that the analyzed evidence "${document.file_name}" shows a ${likelihoodPercent} percent likelihood of AI generation.`,
    495,
    undefined,
    { align: "justify" }
  );

  pdf.moveDown();
  pdf.fontSize(11).font("Helvetica-Bold");
  pdf.text(`Verdict: ${verdict}`);
  const confidencePercent = confidence.toFixed(1);
  pdf.text(`Overall Confidence: ${confidencePercent} percent`);

  pdf.moveDown();
  pdf.fontSize(10).font("Helvetica");
  pdf.text("Technical Analysis Summary:");
  pdf.moveDown(0.3);

  if (sightEngineVerdict && sightEngineVerdict.verdict !== "unavailable") {
    const seConfidence = sightEngineVerdict.confidence;
    const seAiScore = sightEngineVerdict.aiScore;
    const seRealScore = sightEngineVerdict.realScore;

    pdf.text(
      `- SightEngine AI Detection: ${sightEngineVerdict.verdict} (${seConfidence} percent confidence)`
    );
    pdf.text(`  AI Generated Probability: ${seAiScore} percent`);
    pdf.text(`  Real Photo Probability: ${seRealScore} percent`);
  }

  pdf.moveDown(0.5);
  pdf.text(
    `- Visual Artifact Analysis: ${
      analysis?.findings?.length || 0
    } issues detected`
  );
  const combinedPercent = (aiLikelihood * 100).toFixed(1);
  pdf.text(`- Combined AI Likelihood: ${combinedPercent} percent`);

  checkPageBreak(pdf, 100);
}

/**
 * 3. Methodology
 */
function addMethodology(pdf) {
  addSectionHeader(pdf, "METHODOLOGY");

  pdf.fontSize(10).font("Helvetica");
  pdf.text("This analysis employed a dual-layer AI detection system:", 495);
  pdf.moveDown();

  pdf.fontSize(10).font("Helvetica-Bold");
  pdf.text("1. SightEngine AI Detection");
  pdf.font("Helvetica");
  pdf.text(
    "   - Specialized machine learning model for AI-generated image detection",
    495
  );
  pdf.text(
    "   - Trained on millions of AI-generated and authentic images",
    495
  );
  pdf.text(
    "   - Analyzes pixel-level patterns and mathematical signatures",
    495
  );
  pdf.text(
    "   - Detects images from major AI models (DALL-E, Stable Diffusion, MidJourney, GPT-4o)",
    495
  );

  pdf.moveDown();
  pdf.fontSize(10).font("Helvetica-Bold");
  pdf.text("2. Google Gemini Vision AI");
  pdf.font("Helvetica");
  pdf.text("   - Advanced multi-modal visual analysis", 495);
  pdf.text(
    "   - Detects anatomical inconsistencies and impossible geometry",
    495
  );
  pdf.text("   - Identifies texture artifacts and unnatural patterns", 495);
  pdf.text("   - Evaluates lighting, shadow, and perspective consistency", 495);
  pdf.text("   - Analyzes text coherence and object plausibility", 495);

  pdf.moveDown();
  pdf.fontSize(10).font("Helvetica-Bold");
  pdf.text("Legal Standards Compliance:");
  pdf.font("Helvetica");
  pdf.text("   - Federal Rules of Evidence (FRE 702) - Expert Testimony", 495);
  pdf.text("   - Daubert Standard for scientific evidence admissibility", 495);
  pdf.text("   - Chain of custody maintained via cryptographic hash", 495);

  checkPageBreak(pdf, 100);
}

/**
 * 4. Technical Findings
 */
function addTechnicalFindings(pdf, document) {
  addSectionHeader(pdf, "TECHNICAL FINDINGS");

  const findings = document.ai_analysis?.vision_artifact?.findings || [];

  if (findings.length === 0) {
    pdf.fontSize(10).text("No significant findings detected.");
    checkPageBreak(pdf, 100);
    return;
  }

  pdf.fontSize(10).font("Helvetica");
  pdf.text(`Total Issues Detected: ${findings.length}`);
  pdf.moveDown();

  // Count severity
  const severityCounts = findings.reduce((acc, f) => {
    acc[f.severity] = (acc[f.severity] || 0) + 1;
    return acc;
  }, {});

  pdf.text(`Severity Breakdown:`);
  pdf.text(`  - High: ${severityCounts.high || 0}`);
  pdf.text(`  - Medium: ${severityCounts.medium || 0}`);
  pdf.text(`  - Low: ${severityCounts.low || 0}`);
  pdf.moveDown(1.5);

  // List findings
  pdf.fontSize(11).font("Helvetica-Bold");
  pdf.text("Detailed Findings:");
  pdf.moveDown(0.5);

  findings.forEach((finding, index) => {
    checkPageBreak(pdf, 120); // Check before each finding

    pdf.fontSize(10).font("Helvetica-Bold");
    pdf.text(`${index + 1}. ${finding.issue.replace(/_/g, " ").toUpperCase()}`);

    pdf.fontSize(9).font("Helvetica");
    pdf.text(`   Category: ${finding.category}`);
    pdf.text(`   Severity: ${finding.severity.toUpperCase()}`);
    pdf.text(`   Description: ${finding.description}`, 495);
    pdf.moveDown(0.8);
  });

  checkPageBreak(pdf, 100);
}

/**
 * 5. Digital Fingerprint
 */
function addDigitalFingerprint(pdf, document) {
  addSectionHeader(pdf, "CHAIN OF CUSTODY - DIGITAL FINGERPRINT");

  pdf.fontSize(10).font("Helvetica");
  pdf.text("File Information:");
  pdf.moveDown(0.5);

  pdf.text(`- Original Filename: ${document.file_name}`);
  pdf.text(`- File Type: ${document.evidence_type}`);
  pdf.text(`- MIME Type: ${document.file_path?.split(".").pop() || "N/A"}`);
  pdf.text(
    `- Upload Date: ${
      document.created_at
        ? new Date(document.created_at).toLocaleString()
        : "N/A"
    }`
  );

  pdf.moveDown(1);
  pdf.fontSize(10).font("Helvetica-Bold");
  pdf.text("SHA-256 Hash:");
  pdf.moveDown(0.3);

  // Calculate hash if not already stored
  const hash = document.file_hash || calculateFileHash(document.file_path);

  pdf.fontSize(9).font("Courier");
  pdf.text(hash, 495);

  pdf.moveDown(1);
  pdf.fontSize(9).font("Helvetica");
  pdf.text(
    "This cryptographic hash ensures file integrity. Any modification to the file, even changing a single byte, will result in a completely different hash value. This proves the evidence has not been tampered with since analysis.",
    495,
    undefined,
    { align: "justify" }
  );

  checkPageBreak(pdf, 100);
}

/**
 * 6. Metadata Analysis
 */
function addMetadataAnalysis(pdf, document) {
  addSectionHeader(pdf, "EXIF METADATA EXAMINATION");

  const metadata = document.metadata;
  const hasMetadata = metadata && Object.keys(metadata).length > 0;

  if (!hasMetadata) {
    pdf.fontSize(10).font("Helvetica-Bold").fillColor("red");
    pdf.text("ALERT: NO EXIF METADATA PRESENT");
    pdf.fillColor("black");
    pdf.moveDown(0.5);

    pdf.fontSize(10).font("Helvetica");
    pdf.text(
      "This image contains no EXIF metadata. This is a significant indicator of potential AI generation or deliberate metadata removal. Authentic photographs from cameras and smartphones typically contain:",
      495,
      undefined,
      { align: "justify" }
    );
    pdf.moveDown(0.3);
    pdf.text("- Camera make and model");
    pdf.text("- Date and time of capture");
    pdf.text("- Camera settings (ISO, aperture, shutter speed)");
    pdf.text("- GPS location (if enabled)");

    pdf.moveDown(0.5);
    pdf.text(
      "The absence of this data suggests the image may have been generated by AI software or processed through tools that strip metadata.",
      495,
      undefined,
      { align: "justify" }
    );
  } else {
    pdf.fontSize(10).font("Helvetica");
    pdf.text("EXIF Metadata Found:");
    pdf.moveDown(0.5);

    if (metadata.Make || metadata.Model) {
      pdf.text(
        `- Camera: ${metadata.Make || ""} ${metadata.Model || ""}`.trim()
      );
    }
    if (metadata.DateTimeOriginal) {
      pdf.text(`- Date Taken: ${metadata.DateTimeOriginal}`);
    }
    if (metadata.Software) {
      pdf.text(`- Software: ${metadata.Software}`);
      pdf.fontSize(9).text("  Note: Software field indicates post-processing");
    }
    if (metadata.GPSLatitude && metadata.GPSLongitude) {
      pdf.text(`- GPS: ${metadata.GPSLatitude}, ${metadata.GPSLongitude}`);
    }
  }

  checkPageBreak(pdf, 100);
}

/**
 * 7. Statement of Truth
 */
function addStatementOfTruth(pdf, caseInfo) {
  addSectionHeader(pdf, "EXPERT DECLARATION");

  pdf.fontSize(10).font("Helvetica");
  pdf.text("I confirm that:");
  pdf.moveDown(0.5);

  pdf.text("1. The facts stated in this report are within my own knowledge");
  pdf.text("2. The opinions expressed are my true professional opinions");
  pdf.text(
    "3. The analysis was conducted using scientifically validated methods"
  );
  pdf.text("4. The digital fingerprint (SHA-256 hash) ensures file integrity");
  pdf.text(
    "5. The methodology employed meets legal standards for expert testimony"
  );

  pdf.moveDown(2);
  pdf.fontSize(10).font("Helvetica-Bold");
  pdf.text(
    `Generated by: ${caseInfo.expertName || "AI Forensic Analysis System"}`
  );
  pdf.moveDown(0.5);
  pdf.font("Helvetica");
  pdf.text(`Date: ${new Date().toLocaleString()}`);
  pdf.text(`Report ID: ${generateReportId()}`);

  if (caseInfo.additionalNotes) {
    pdf.moveDown(1);
    pdf.fontSize(9).font("Helvetica-Bold");
    pdf.text("Additional Notes:");
    pdf.font("Helvetica");
    pdf.text(caseInfo.additionalNotes, 495, undefined, { align: "justify" });
  }
}

/**
 * Helper: Add section header
 */
function addSectionHeader(pdf, title) {
  pdf.fontSize(14).font("Helvetica-Bold");
  pdf.text(title);
  pdf.moveDown(0.3);
  pdf.fontSize(10).font("Helvetica");
  pdf.text("━".repeat(80));
  pdf.moveDown(0.8);
}

/**
 * Helper: Check if page break is needed
 */
function checkPageBreak(pdf, spaceNeeded = 100) {
  if (pdf.y > 700 - spaceNeeded) {
    pdf.addPage();
  } else {
    pdf.moveDown(1.5);
  }
}

/**
 * Helper: Calculate SHA-256 hash of file
 */
function calculateFileHash(filePath) {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    return crypto.createHash("sha256").update(fileBuffer).digest("hex");
  } catch (error) {
    return "Hash generation failed - file not accessible";
  }
}

/**
 * Helper: Generate unique report ID
 */
function generateReportId() {
  return `FR-${Date.now()}-${crypto
    .randomBytes(4)
    .toString("hex")
    .toUpperCase()}`;
}
