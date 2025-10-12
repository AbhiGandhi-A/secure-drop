export default function FilePreview({ file }) {
  if (!file) return null
  const isImage = file.mimeType?.startsWith("image/")
  const isPdf = file.mimeType === "application/pdf"
  return (
    <div className="preview">
      {isImage && <img src={`/static/${encodeURIComponent(file.filename)}`} alt="preview" />}
      {isPdf && <iframe title="pdf" src={`/static/${encodeURIComponent(file.filename)}`} />}
      {!isImage && !isPdf && <div className="muted">Preview not available</div>}
    </div>
  )
}
