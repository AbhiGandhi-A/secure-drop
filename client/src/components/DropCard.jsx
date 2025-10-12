"use client"

export default function DropCard({ d, onDelete }) {
  return (
    <div className="drop-card">
      <div className="row between">
        <div>
          <div className="muted">{new Date(d.createdAt).toLocaleString()}</div>
          <div className="title">{d.filename || (d.messagePreview ? "Message" : "(empty)")}</div>
        </div>
        <button className="btn-outline" onClick={() => onDelete(d.id)} disabled={d.isDeleted}>
          {d.isDeleted ? "Deleted" : "Delete"}
        </button>
      </div>
      <div className="muted">
        Downloads: {d.downloadsCount}/{d.maxDownloads}
      </div>
      <div className="muted">Expires: {new Date(d.expiresAt).toLocaleString()}</div>
    </div>
  )
}
