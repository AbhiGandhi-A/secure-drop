const bcrypt = require("bcrypt")
const ROUNDS = 12

async function hashValue(value) {
  return bcrypt.hash(value, ROUNDS)
}
async function compareValue(value, hash) {
  return bcrypt.compare(value, hash)
}

module.exports = { hashValue, compareValue }
