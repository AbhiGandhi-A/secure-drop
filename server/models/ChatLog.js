const mongoose = require("mongoose")

const ChatLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    query: { type: String, required: true },
    response: { type: String, required: true },
  },
  { timestamps: true },
)

ChatLogSchema.index({ createdAt: -1 })

module.exports = mongoose.model("ChatLog", ChatLogSchema)
