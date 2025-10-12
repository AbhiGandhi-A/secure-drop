const mongoose = require("mongoose")

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, default: "" },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    subscriptionPlan: {
      type: String,
      enum: ["FREE", "PREMIUM_MONTHLY", "PREMIUM_YEARLY"],
      default: "FREE",
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model("User", UserSchema)
