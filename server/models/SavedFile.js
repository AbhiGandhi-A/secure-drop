const mongoose = require("mongoose")

const SavedFileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Types.ObjectId, ref: "User", required: true, index: true },
    folderId: { type: mongoose.Types.ObjectId, ref: "Folder", default: null, index: true },
    filename: { type: String, required: true },
    mimeType: { type: String, required: true },
    sizeBytes: { type: Number, required: true },
    filePath: { type: String, required: true }, // absolute or relative path in storage
  },
  { timestamps: true },
)

module.exports = mongoose.model("SavedFile", SavedFileSchema)
