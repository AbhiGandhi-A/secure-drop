function notFound(req, res) {
  return res.status(404).json({ error: "Not found" })
}

function errorHandler(err, req, res, next) {
  // eslint-disable-next-line no-console
  console.error("[error]", err)
  const status = err.status || 500
  res.status(status).json({ error: err.message || "Server error" })
}

module.exports = { notFound, errorHandler }
