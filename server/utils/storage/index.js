// Storage abstraction for local (default) and S3 (future)
const { storageDriver } = require("../../config/env")

let driver
if (storageDriver === "s3") {
  driver = require("./s3") // placeholder for future
} else {
  driver = require("./local")
}

module.exports = driver
