"use client"

export default function Contact() {
  return (
    <div className="card narrow">
      <h1>Contact</h1>
      <p>Questions, feedback, or abuse reports? Reach out using the form below or email us at support@example.com.</p>
      <form className="form" onSubmit={(e) => e.preventDefault()}>
        <label>Your email</label>
        <input placeholder="you@example.com" />
        <label>Subject</label>
        <input placeholder="How can we help?" />
        <label>Message</label>
        <textarea rows={5} placeholder="Tell us more..." />
        <button className="btn-primary" type="submit" aria-disabled="true" title="Demo form">
          Send (demo)
        </button>
      </form>
      <div className="muted" style={{ marginTop: 12 }}>
        We typically reply within 2 business days.
      </div>
    </div>
  )
}
