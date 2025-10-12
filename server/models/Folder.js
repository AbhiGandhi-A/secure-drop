const mongoose = require("mongoose")

const FolderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    parentId: { type: mongoose.Types.ObjectId, ref: "Folder", default: null, index: true },
  },
  { timestamps: true },
)

module.exports = mongoose.model("Folder", FolderSchema)
