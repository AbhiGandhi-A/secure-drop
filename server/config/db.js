const mongoose = require("mongoose")
const { mongoUri, nodeEnv } = require("./env")

async function connectDB() {
  if (!mongoUri) throw new Error("MONGODB_URI is not set")
  mongoose.set("strictQuery", true)
  await mongoose.connect(mongoUri, { dbName: "secure-mern" })
  console.log(`[db] Connected to MongoDB (${nodeEnv})`)
}

module.exports = { connectDB }
