const mongoose = require("mongoose")

const DropSchema = new mongoose.Schema(
  {
    tokenHash: { type: String, required: true, index: true }, // hashed PIN
    shortPIN: { type: String, default: null }, // optional display/masked; can be null for security
    uploaderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

    message: { type: String, default: "" },

    filename: { type: String, default: "" },
    mimeType: { type: String, default: "" },
    filePath: { type: String, default: "" }, // local path (or s3 key later)

    maxDownloads: { type: Number, default: 1 },
    downloadsCount: { type: Number, default: 0 },
    oneTime: { type: Boolean, default: false },

    isDeleted: { type: Boolean, default: false },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
)

DropSchema.index({ expiresAt: 1 })
DropSchema.index({ uploaderId: 1, createdAt: -1 })

module.exports = mongoose.model("Drop", DropSchema)
