const { validationResult } = require("express-validator")
const ChatLog = require("../models/ChatLog")
const { openaiApiKey } = require("../config/env")
const fetch = require("node-fetch")

async function chatbotQuery(req, res, next) {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })
    if (!openaiApiKey) return res.status(500).json({ error: "OpenAI not configured" })

    const { query } = req.body
    const prompt = `You are a helpful assistant for an anonymous file & message sharing site. Help with FAQs, safety, and navigation. Question: ${query}`

    // Minimal Chat Completions call
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a concise, helpful assistant." },
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
      }),
    })
    const data = await r.json()
    const text = data?.choices?.[0]?.message?.content?.trim() || "Sorry, I could not generate a response."

    await ChatLog.create({ userId: req.user?.id || null, query, response: text })

    res.json({ response: text })
  } catch (e) {
    next(e)
  }
}

module.exports = { chatbotQuery }
