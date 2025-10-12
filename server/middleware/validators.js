const { body } = require("express-validator")

const emailRule = body("email").isEmail().normalizeEmail()
const passwordRule = body("password").isString().isLength({ min: 8, max: 100 })
const nameRule = body("name").optional().isString().isLength({ min: 1, max: 100 })

const pinRule = body("pin")
  .isString()
  .isLength({ min: 6, max: 8 })
  .matches(/^[A-Za-z0-9]+$/)

const createDropRules = [
  body("message").optional().isString().isLength({ max: 10000 }),
  body("expiresInHours")
    .optional()
    .isInt({ min: 1, max: 24 * 30 }),
  body("maxDownloads").optional().isInt({ min: 1, max: 100 }),
  body("oneTime").optional().isBoolean(),
]

const chatbotRules = [body("query").isString().isLength({ min: 1, max: 2000 })]

module.exports = {
  emailRule,
  passwordRule,
  nameRule,
  pinRule,
  createDropRules,
  chatbotRules,
}
