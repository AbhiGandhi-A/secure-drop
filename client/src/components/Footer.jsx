import AdSlot from "./AdSlot.jsx"

export default function Footer() {
  return (
    <footer className="footer">
      <AdSlot slotName="footer-ad" />
      <div className="muted">© {new Date().getFullYear()} Secure Drops</div>
    </footer>
  )
}
