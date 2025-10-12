"use client"

import { useEffect, useState } from "react"
import api from "../api/client.js"
import { notify } from "./Notifications.jsx"
import "../../../styles/files.css"

export default function SavedFiles() {
  const [files, setFiles] = useState([])
  const [folders, setFolders] = useState([])
  const [fileToShare, setFileToShare] = useState(null)
  const [shareCfg, setShareCfg] = useState({ expiresInHours: 24, maxDownloads: 1, oneTime: false, message: "" })
  const [uploadFile, setUploadFile] = useState(null)
  const [newFolderName, setNewFolderName] = useState("")
  const [selectedFolder, setSelectedFolder] = useState(null)

  const load = async () => {
    try {
      const { data } = await api.get("/api/files/list")
      setFiles(data.files)
      setFolders(data.folders)
    } catch {
      notify("Failed to load saved files", "error")
    }
  }

  useEffect(() => {
    load()
  }, [])

  const onUpload = async (e) => {
    e.preventDefault()
    if (!uploadFile) return notify("Choose a file", "error")
    const fd = new FormData()
    fd.append("file", uploadFile)
    if (selectedFolder?.id) fd.append("folderId", selectedFolder.id)
    try {
      await api.post("/api/files/upload", fd, { headers: { "Content-Type": "multipart/form-data" } })
      setUploadFile(null)
      notify("File saved", "success")
      load()
    } catch (e) {
      notify(e?.response?.data?.error || "Upload failed", "error")
    }
  }

  const onCreateFolder = async (e) => {
    e.preventDefault()
    try {
      await api.post("/api/files/folder", { name: newFolderName })
      setNewFolderName("")
      notify("Folder created", "success")
      load()
    } catch {
      notify("Failed to create folder", "error")
    }
  }

  const openShare = (f) => {
    setFileToShare(f)
    setShareCfg({ expiresInHours: 24, maxDownloads: 1, oneTime: false, message: "" })
  }

  const doShare = async () => {
    if (!fileToShare) return
    try {
      const { data } = await api.post(`/api/files/${fileToShare.id}/share`, shareCfg)
      notify(`PIN: ${data.pin}`, "success")
      setFileToShare(null)
    } catch (e) {
      notify(e?.response?.data?.error || "Share failed", "error")
    }
  }

  return (
    <div className="card files-wrap">
      <div className="card">
        <h3 className="title">Folders</h3>
        <form className="actions" onSubmit={onCreateFolder}>
          <input
            className="input-text"
            placeholder="New folder name"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
          />
          <button className="btn" type="submit">
            Create Folder
          </button>
        </form>
        <div className="grid" style={{ marginTop: 12 }}>
          {folders.map((f) => (
            <div key={f.id} className="card">
              <div className="title">{f.name}</div>
              <div className="meta">ID: {f.id}</div>
              <div className="actions" style={{ marginTop: 8 }}>
                <button
                  className={`btn ${selectedFolder?.id === f.id ? "primary" : ""}`}
                  onClick={() => setSelectedFolder(selectedFolder?.id === f.id ? null : f)}
                  type="button"
                >
                  {selectedFolder?.id === f.id ? "Close" : "Open"}
                </button>
              </div>
            </div>
          ))}
        </div>
        {selectedFolder && (
          <div className="folder-upload" style={{ marginTop: 12 }}>
            <span className="label">Upload to “{selectedFolder.name}”</span>
            <form className="actions" onSubmit={onUpload}>
              <input className="input-file" type="file" onChange={(e) => setUploadFile(e.target.files?.[0] || null)} />
              <button className="btn primary" type="submit">
                Save File
              </button>
              <button className="btn" type="button" onClick={() => setSelectedFolder(null)}>
                Clear
              </button>
            </form>
          </div>
        )}
      </div>

      <div className="card">
        <h3 className="title">Your Saved Files</h3>
        {!selectedFolder && (
          <form className="actions" onSubmit={onUpload}>
            <input className="input-file" type="file" onChange={(e) => setUploadFile(e.target.files?.[0] || null)} />
            <button className="btn primary" type="submit">
              Save File
            </button>
          </form>
        )}

        <div className="grid" style={{ marginTop: 12 }}>
          {files
            .filter((f) => (selectedFolder ? f.folderId === selectedFolder.id : true))
            .map((f) => (
              <div key={f.id} className="card">
                <div className="title">{f.filename}</div>
                <div className="meta">{(f.sizeBytes / 1024 / 1024).toFixed(2)} MB</div>
                <div className="actions" style={{ marginTop: 8 }}>
                  <button className="btn" onClick={() => openShare(f)} type="button">
                    Share
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>

      {fileToShare && (
        <div className="card">
          <h4>Share “{fileToShare.filename}”</h4>
          <div className="row">
            <div>
              <label>Expires (hours)</label>
              <input
                type="number"
                min="1"
                max="168"
                value={shareCfg.expiresInHours}
                onChange={(e) => setShareCfg((s) => ({ ...s, expiresInHours: Number(e.target.value || 1) }))}
              />
            </div>
            <div>
              <label>Max downloads</label>
              <input
                type="number"
                min="1"
                max="100"
                disabled={shareCfg.oneTime}
                value={shareCfg.maxDownloads}
                onChange={(e) => setShareCfg((s) => ({ ...s, maxDownloads: Number(e.target.value || 1) }))}
              />
            </div>
          </div>
          <label className="checkbox">
            <input
              type="checkbox"
              checked={shareCfg.oneTime}
              onChange={(e) => setShareCfg((s) => ({ ...s, oneTime: e.target.checked }))}
            />{" "}
            One-time
          </label>
          <label>Message (optional)</label>
          <textarea
            rows={3}
            value={shareCfg.message}
            onChange={(e) => setShareCfg((s) => ({ ...s, message: e.target.value }))}
            placeholder="Add a note…"
          />
          <div className="row">
            <button className="btn-primary" onClick={doShare}>
              Generate PIN
            </button>
            <button className="btn-outline" onClick={() => setFileToShare(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
