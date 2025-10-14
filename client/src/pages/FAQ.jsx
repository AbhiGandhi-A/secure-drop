export default function FAQ() {
  return (
    <div className="card narrow">
      <h1>Frequently Asked Questions</h1>
      <h3>What is a drop?</h3>
      <p>
        A drop is a secure bundle of a message and optional file which can be accessed with a PIN before it expires or
        hits the download limit.
      </p>
      <h3>How secure is it?</h3>
      <p>
        We generate randomized PINs, store hashed tokens, and automatically remove files when expired or limits are
        reached.
      </p>
      <h3>What happens when the limit is reached?</h3>
      <p>The drop is deleted and the file removed from storage. Recipients will see that the limit has been reached.</p>
      <h3>What are the plan limits?</h3>
      <ul>
        <li>Guest: 6 hours / 3 downloads</li>
        <li>Free: 24 hours / 5 downloads</li>
        <li>Premium Monthly: 1 week / 20 downloads</li>
        <li>Premium Yearly: 2 weeks / unlimited downloads</li>
      </ul>
      <h3>Can I report abuse?</h3>
      <p>Yes—use the Contact page for urgent reports. We take abuse and malware seriously.</p>
    </div>
  )
}
