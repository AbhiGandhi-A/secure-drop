const router = require("express").Router()
const { chatbotRules } = require("../middleware/validators")
const { chatbotQuery } = require("../controllers/chatbotController")
const { limiterChat } = require("../middleware/rateLimit")

router.post("/query", limiterChat, chatbotRules, chatbotQuery)

module.exports = router
