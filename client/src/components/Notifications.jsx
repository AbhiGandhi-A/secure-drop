"use client"

import { useEffect, useState } from "react"

let push
export function notify(msg, kind = "info") {
  if (push) push({ id: Date.now(), msg, kind })
}

export default function Notifications() {
  const [items, setItems] = useState([])
  useEffect(() => {
    push = (n) => setItems((prev) => [...prev, n])
  }, [])
  return (
    <div className="toasts">
      {items.map((t) => (
        <div key={t.id} className={`toast ${t.kind}`}>
          {t.msg}
          <button onClick={() => setItems(items.filter((i) => i.id !== t.id))}>×</button>
        </div>
      ))}
    </div>
  )
}
