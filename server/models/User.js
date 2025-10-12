const mongoose = require("mongoose")

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, default: "" },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    subscriptionPlan: { type: String, enum: ["FREE", "PREMIUM"], default: "FREE" },
  },
  { timestamps: true },
)

// UserSchema.index({ email: 1 }, { unique: true })

module.exports = mongoose.model("User", UserSchema)
