const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const compression = require("compression");
const morgan = require("morgan");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");

const { connectDB } = require("./config/db");
const { port, corsOrigin, uploadDir } = require("./config/env");
const { limiterGeneral } = require("./middleware/rateLimit");
const { notFound, errorHandler } = require("./middleware/errorHandler");
const { startExpiryWorker } = require("./cron/expiryWorker");

const app = express();

// ✅ Required for Render / proxies (Fixes X-Forwarded-For error)
app.set("trust proxy", 1);

// ✅ Security & middleware setup
app.use(helmet());
app.use(
  cors({
    origin: corsOrigin === "*" ? true : corsOrigin,
    credentials: true,
  })
);
app.use(compression());
app.use(morgan("dev"));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize());
app.use(xss());
app.use(limiterGeneral);

// ✅ Static serving for uploads (previews only)
app.use(
  "/static",
  express.static(uploadDir, {
    fallthrough: true,
    maxAge: "1h",
  })
);

// ✅ API routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/drops", require("./routes/drops"));
app.use("/api/user", require("./routes/user"));
app.use("/api/chatbot", require("./routes/chatbot"));
app.use("/api/billing", require("./routes/billing"));
app.use("/api/files", require("./routes/files"));

// ✅ Fallback and error handling
app.use(notFound);
app.use(errorHandler);

// ✅ Connect to MongoDB and start server
connectDB()
  .then(() => {
    startExpiryWorker();
    app.listen(port, () => console.log(`[server] Running on port ${port}`));
  })
  .catch((err) => {
    console.error("[server] Failed to start:", err);
    process.exit(1);
  });
