export default function Privacy() {
  return (
    <div className="card narrow">
      <h1>Privacy Policy</h1>
      <p>We take your privacy seriously. This policy explains what we collect, how we use it, and your choices.</p>
      <h2>Information We Collect</h2>
      <ul>
        <li>Account data (name, email) for registered users</li>
        <li>Authentication tokens to keep you signed in</li>
        <li>Drop metadata (expiry, download counts) required to provide the service</li>
        <li>Files you upload for sharing (subject to automatic security scans)</li>
      </ul>
      <h2>How We Use Information</h2>
      <ul>
        <li>Operate and improve Secure Drops</li>
        <li>Prevent abuse, fraud, and malware</li>
        <li>Provide support and communicate service updates</li>
      </ul>
      <h2>Data Retention</h2>
      <p>
        Drops expire automatically based on your settings; expired files are removed. We retain account data while your
        account remains active, and as required by law.
      </p>
      <h2>Your Choices</h2>
      <ul>
        <li>Adjust drop expiration and download limits</li>
        <li>Delete your drops or account at any time</li>
        <li>Contact us for data access or deletion requests</li>
      </ul>
      <p>Questions? See our Contact page.</p>
    </div>
  )
}
