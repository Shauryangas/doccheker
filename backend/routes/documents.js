import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import exifr from "exifr";
import Document from "../models/Document.js";
import Case from "../models/Case.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// All routes are protected
router.use(protect);

// Create uploads directories for each evidence type
const uploadsDir = "uploads";
const evidenceDirs = {
  image: path.join(uploadsDir, "images"),
  voice: path.join(uploadsDir, "voices"),
  video: path.join(uploadsDir, "videos"),
};

// Create all directories if they don't exist
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

Object.values(evidenceDirs).forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure multer for evidence upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Store temporarily in uploads folder, will be moved to correct subfolder after validation
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// File type validations for each evidence type
const fileTypeValidations = {
  image: {
    extensions: /jpg|jpeg|png|gif|webp|heic/,
    mimetypes: /image\/(jpeg|png|gif|webp|heic)/,
    maxSize: 10 * 1024 * 1024, // 10MB
  },
  voice: {
    extensions: /mp3|wav|m4a|ogg|aac|flac/,
    mimetypes: /audio\/(mpeg|wav|mp4|ogg|aac|flac)/,
    maxSize: 50 * 1024 * 1024, // 50MB
  },
  video: {
    extensions: /mp4|mov|avi|mkv|webm/,
    mimetypes: /video\/(mp4|quicktime|x-msvideo|x-matroska|webm)/,
    maxSize: 200 * 1024 * 1024, // 200MB
  },
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 200 * 1024 * 1024, // Max 200MB (will be validated per type)
  },
  fileFilter: (req, file, cb) => {
    // Accept all image, audio, and video files
    // Specific validation will happen in the route handler
    const allowedMimetypes =
      /image\/(jpeg|png|gif|webp|heic)|audio\/(mpeg|wav|mp4|ogg|aac|flac)|video\/(mp4|quicktime|x-msvideo|x-matroska|webm)/;
    const allowedExtensions =
      /jpg|jpeg|png|gif|webp|heic|mp3|wav|m4a|ogg|aac|flac|mp4|mov|avi|mkv|webm/;

    const extname = allowedExtensions.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedMimetypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(
        new Error(
          "Invalid file type. Only images, audio, and video files are allowed"
        )
      );
    }
  },
});

// Helper function to generate SHA-256 hash
const generateFileHash = (filePath) => {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash("sha256");
    const stream = fs.createReadStream(filePath);

    stream.on("data", (data) => hash.update(data));
    stream.on("end", () => resolve(hash.digest("hex")));
    stream.on("error", (error) => reject(error));
  });
};

// Helper function to extract metadata from images
const extractMetadata = async (filePath, evidenceType) => {
  if (evidenceType !== "image") {
    return {};
  }

  try {
    const metadata = await exifr.parse(filePath, {
      pick: [
        "Make",
        "Model",
        "DateTimeOriginal",
        "Software",
        "GPSLatitude",
        "GPSLongitude",
        "GPSAltitude",
      ],
    });

    return metadata || {};
  } catch (error) {
    console.log("Metadata extraction failed (non-fatal):", error.message);
    return {};
  }
};

// @route   GET /api/documents/case/:caseId
// @desc    Get all documents for a case
// @access  Private
router.get("/case/:caseId", async (req, res) => {
  try {
    // Verify case belongs to user
    const caseData = await Case.findOne({
      _id: req.params.caseId,
      lawyer_id: req.user._id,
    });

    if (!caseData) {
      return res.status(404).json({
        success: false,
        message: "Case not found",
      });
    }

    const documents = await Document.find({ case_id: req.params.caseId })
      .sort({ createdAt: -1 })
      .populate("uploaded_by", "name email");

    res.json({
      success: true,
      data: documents,
    });
  } catch (error) {
    console.error("Get documents error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching documents",
    });
  }
});

// @route   POST /api/documents
// @desc    Upload document
// @access  Private
router.post("/", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a file",
      });
    }

    const { case_id } = req.body;

    // Verify case belongs to user
    const caseData = await Case.findOne({
      _id: case_id,
      lawyer_id: req.user._id,
    });

    if (!caseData) {
      // Delete uploaded file if case not found
      fs.unlinkSync(req.file.path);
      return res.status(404).json({
        success: false,
        message: "Case not found",
      });
    }

    // Get evidence_type from request body
    let { evidence_type } = req.body;

    // AUTO-DETECT evidence type if not provided (production fix)
    if (!evidence_type) {
      console.log(
        "⚠️ evidence_type not provided, auto-detecting from MIME type:",
        req.file.mimetype
      );

      if (req.file.mimetype.startsWith("image/")) {
        evidence_type = "image";
      } else if (req.file.mimetype.startsWith("audio/")) {
        evidence_type = "voice";
      } else if (req.file.mimetype.startsWith("video/")) {
        evidence_type = "video";
      }

      console.log("✓ Auto-detected evidence_type:", evidence_type);
    }

    // Validate evidence type
    if (
      !evidence_type ||
      !["image", "voice", "video"].includes(evidence_type)
    ) {
      console.error(
        "❌ Invalid evidence_type:",
        evidence_type,
        "| Body:",
        req.body,
        "| MIME:",
        req.file.mimetype
      );
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: `Invalid evidence type: "${evidence_type}". Must be image, voice, or video.`,
        debug: {
          received_evidence_type: evidence_type,
          file_mimetype: req.file.mimetype,
          body_keys: Object.keys(req.body),
        },
      });
    }

    console.log("📁 Processing evidence upload:", {
      evidence_type,
      filename: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
    });

    // Validate that file type matches evidence type
    const validation = fileTypeValidations[evidence_type];
    const extname = validation.extensions.test(
      path.extname(req.file.originalname).toLowerCase()
    );
    const mimetype = validation.mimetypes.test(req.file.mimetype);

    if (!extname || !mimetype) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: `File type does not match ${evidence_type} evidence. Please upload a valid ${evidence_type} file.`,
      });
    }

    // Validate file size for evidence type
    if (req.file.size > validation.maxSize) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: `File size exceeds limit for ${evidence_type} (max ${
          validation.maxSize / 1024 / 1024
        }MB)`,
      });
    }

    // Move file to correct evidence subfolder
    const targetDir = evidenceDirs[evidence_type];
    const newFilePath = path.join(targetDir, path.basename(req.file.path));
    fs.renameSync(req.file.path, newFilePath);

    // Generate SHA-256 hash
    const fileHash = await generateFileHash(newFilePath);

    // Extract metadata (EXIF for images)
    const metadata = await extractMetadata(newFilePath, evidence_type);

    // Determine analysis status
    const analysisStatus =
      evidence_type === "image" && Object.keys(metadata).length > 0
        ? "metadata_extracted"
        : "uploaded";

    // Get relative path for file_url
    const relativePath = path
      .relative(uploadsDir, newFilePath)
      .replace(/\\/g, "/");

    const document = await Document.create({
      case_id,
      file_name: req.file.originalname,
      file_path: newFilePath,
      file_url: `/uploads/${relativePath}`,
      file_size: req.file.size,
      file_type: path.extname(req.file.originalname).toLowerCase(),
      evidence_type,
      file_hash: fileHash,
      upload_timestamp: new Date(),
      metadata,
      analysis_status: analysisStatus,
      uploaded_by: req.user._id,
    });

    // Prepare metadata summary for response
    const metadataSummary = {};
    if (metadata.Make || metadata.Model) {
      metadataSummary.camera = `${metadata.Make || ""} ${
        metadata.Model || ""
      }`.trim();
    }
    if (metadata.DateTimeOriginal) {
      metadataSummary.dateTaken = metadata.DateTimeOriginal;
    }
    if (metadata.Software) {
      metadataSummary.software = metadata.Software;
    }
    if (metadata.GPSLatitude && metadata.GPSLongitude) {
      metadataSummary.location = {
        latitude: metadata.GPSLatitude,
        longitude: metadata.GPSLongitude,
      };
    }

    // Prepare flags
    const flags = [];
    if (evidence_type === "image" && Object.keys(metadata).length === 0) {
      flags.push({
        type: "warning",
        message: "No metadata found - file may have been edited",
      });
    }

    res.status(201).json({
      success: true,
      message: "Evidence uploaded successfully",
      data: {
        ...document.toObject(),
        metadataSummary,
        flags,
      },
    });
  } catch (error) {
    console.error("Upload document error:", error);

    // Delete file if database operation failed
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: "Error uploading document",
    });
  }
});

// @route   DELETE /api/documents/:id
// @desc    Delete document
// @access  Private
router.delete("/:id", async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    // Verify case belongs to user
    const caseData = await Case.findOne({
      _id: document.case_id,
      lawyer_id: req.user._id,
    });

    if (!caseData) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    // Delete file from filesystem
    if (fs.existsSync(document.file_path)) {
      fs.unlinkSync(document.file_path);
    }

    await document.deleteOne();

    res.json({
      success: true,
      message: "Document deleted successfully",
    });
  } catch (error) {
    console.error("Delete document error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting document",
    });
  }
});

// @route   POST /api/documents/:id/analyze
// @desc    Analyze evidence with AI (placeholder for future implementation)
// @access  Private
router.post("/:id/analyze", async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Evidence not found",
      });
    }

    // Verify case belongs to user
    const caseData = await Case.findOne({
      _id: document.case_id,
      lawyer_id: req.user._id,
    });

    if (!caseData) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    // TODO: Implement actual AI analysis here
    // For now, just update status
    document.analysis_status = "analyzed";
    await document.save();

    res.json({
      success: true,
      message: "AI analysis initiated (placeholder)",
      data: document,
    });
  } catch (error) {
    console.error("Analyze evidence error:", error);
    res.status(500).json({
      success: false,
      message: "Error analyzing evidence",
    });
  }
});

export default router;
