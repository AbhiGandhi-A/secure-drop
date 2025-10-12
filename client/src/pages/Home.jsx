import DropForm from "../components/DropForm.jsx"
import AdSlot from "../components/AdSlot.jsx"

export default function Home() {
  return (
    <div className="grid-2">
      <DropForm />
      <div className="info card">
        <h2>How it works</h2>
        <ol>
          <li>Write a message and/or upload a file.</li>
          <li>Click Send to generate a secure PIN.</li>
          <li>Share the PIN with the recipient.</li>
          <li>Recipient enters the PIN to unlock and download.</li>
        </ol>
        <AdSlot slotName="home-right" />
      </div>
    </div>
  )
}
