export default function About() {
  return (
    <div className="card narrow">
      <h1>About Secure Drops</h1>
      <p>
        Secure Drops is a privacy-focused way to share messages and files using short-lived PINs and download limits.
        Our mission is to make secure sharing effortless for everyone—from casual users to professionals—by combining
        strong defaults, clean design, and transparent limits.
      </p>
      <h2>How It Works</h2>
      <ul>
        <li>Create a drop with a message and optionally a file.</li>
        <li>Pick an expiry time and download limit (or one-time download).</li>
        <li>We generate a PIN—share that PIN securely with the recipient.</li>
        <li>The recipient unlocks the drop with the PIN before it expires.</li>
      </ul>
      <h2>Plans and Limits</h2>
      <ul>
        <li>Guest (Anonymous): up to 6 hours, 3 downloads</li>
        <li>Free Account: up to 24 hours, 5 downloads</li>
        <li>Premium Monthly: up to 1 week, 20 downloads</li>
        <li>Premium Yearly: up to 2 weeks, unlimited downloads</li>
      </ul>
      <p>We respect user privacy and avoid collecting unnecessary data. See our Privacy Policy for full details.</p>
    </div>
  )
}
