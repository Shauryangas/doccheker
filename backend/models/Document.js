import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    case_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Case",
      required: true,
      index: true,
    },
    file_name: {
      type: String,
      required: [true, "File name is required"],
    },
    file_path: {
      type: String,
      required: [true, "File path is required"],
    },
    file_url: {
      type: String,
      required: true,
    },
    file_size: {
      type: Number,
      required: true,
    },
    evidence_type: {
      type: String,
      enum: ["image", "voice", "video"],
      required: [true, "Evidence type is required"],
      index: true,
    },
    file_type: {
      type: String,
      required: true,
    },
    file_hash: {
      type: String,
      required: true,
      index: true,
    },
    upload_timestamp: {
      type: Date,
      default: Date.now,
      required: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    analysis_status: {
      type: String,
      enum: ["uploaded", "metadata_extracted", "analyzed"],
      default: "uploaded",
      index: true,
    },
    uploaded_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
documentSchema.index({ case_id: 1, createdAt: -1 });

const Document = mongoose.model("Document", documentSchema);

export default Document;
