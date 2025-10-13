const express = require("express")
const helmet = require("helmet")
const cors = require("cors")
const compression = require("compression")
const morgan = require("morgan")
const mongoSanitize = require("express-mongo-sanitize")
const xss = require("xss-clean")

const { connectDB } = require("./config/db")
const { port, corsOrigin, uploadDir } = require("./config/env")
const { limiterGeneral } = require("./middleware/rateLimit")
const { notFound, errorHandler } = require("./middleware/errorHandler")
const { startExpiryWorker } = require("./cron/expiryWorker")

const app = express()
app.set("trust proxy", 1); 
app.use(helmet())
app.use(cors({ origin: corsOrigin === "*" ? true : corsOrigin, credentials: true }))
app.use(compression())
app.use(morgan("dev"))
app.use(express.json({ limit: "1mb" }))
app.use(express.urlencoded({ extended: true }))
app.use(mongoSanitize())
app.use(xss())
app.use(limiterGeneral)

// Static serving for downloads preview (images/pdf); actual download via route
app.use("/static", express.static(uploadDir, { fallthrough: true, maxAge: "1h" }))

// Routes
app.use("/api/auth", require("./routes/auth"))
app.use("/api/drops", require("./routes/drops"))
app.use("/api/user", require("./routes/user"))
app.use("/api/chatbot", require("./routes/chatbot"))
app.use("/api/billing", require("./routes/billing"))
app.use("/api/files", require("./routes/files")) // mount files routes for saved files/folders and sharing

app.use(notFound)
app.use(errorHandler)

app.get("/sitemap.xml", (req, res) => {
  res.header("Content-Type", "application/xml");

  const baseUrl = "https://secure-drop-phi.vercel.app";
  const pages = [
    { loc: `${baseUrl}/`, priority: 1.0 },
    { loc: `${baseUrl}/about`, priority: 0.8 },
    { loc: `${baseUrl}/contact`, priority: 0.8 },
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${pages.map(p => `<url><loc>${p.loc}</loc><priority>${p.priority}</priority></url>`).join('')}
</urlset>`;

  res.send(xml);
});


connectDB()
  .then(() => {
    startExpiryWorker()
    app.listen(port, () => console.log(`[server] listening on :${port}`))
  })
  .catch((e) => {
    console.error("[server] failed to start", e)
    process.exit(1)
  })
