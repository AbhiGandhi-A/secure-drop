const { pin } = require("../config/constants")
const { hashValue } = require("./hash")

function generatePIN() {
  const len = Math.floor(Math.random() * (pin.maxLen - pin.minLen + 1)) + pin.minLen
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789" // avoid confusing chars
  let s = ""
  for (let i = 0; i < len; i++) {
    s += alphabet[Math.floor(Math.random() * alphabet.length)]
  }
  return s
}

async function generateHashedPIN() {
  const plain = generatePIN()
  const tokenHash = await hashValue(plain)
  return { plain, tokenHash }
}

function maskPIN(plain) {
  if (!plain) return null
  const last2 = plain.slice(-2)
  return `****${last2}`
}

module.exports = { generateHashedPIN, maskPIN }
