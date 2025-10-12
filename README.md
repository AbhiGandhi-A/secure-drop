# Secure MERN Drop

Anonymous and account-based message/file sharing with PIN unlock, plan-based limits, and Razorpay monetization.

## Razorpay Integration (replaces Stripe)

1) Environment variables (server/.env):
- RAZORPAY_KEY_ID=rzp_test_xxx
- RAZORPAY_KEY_SECRET=xxx_secret_xxx
- RAZORPAY_PRICE_MONTHLY=19900   (₹199.00)
- RAZORPAY_PRICE_YEARLY=199000   (₹1,990.00)

2) Server:
- The backend exposes:
  - POST /api/billing/create-order — creates a Razorpay order for monthly/yearly plans.
  - POST /api/billing/confirm — verifies the signature and upgrades the user to premium.
- Prices are configured via environment variables (in paise). The confirm endpoint validates HMAC using RAZORPAY_KEY_SECRET.

3) Client:
- Profile page dynamically loads the Razorpay Checkout script, opens the payment modal, and then calls /api/billing/confirm on success.

4) Test Mode:
- Use Razorpay test key/secret and test cards. See Razorpay docs for test credentials.

5) Production:
- Replace test keys with live keys and set secure CORS_ORIGIN. Ensure HTTPS is enabled on the backend host.

## Google AdSense Setup

1) AdSense Account & Site Verification:
- Create/verify your site at https://www.google.com/adsense
- Add the AdSense verification snippet to client/index.html <head> as instructed by Google.

2) Page-Level Ads Script:
- Insert the global AdSense script into client/index.html <head>:
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=YOUR-CLIENT-ID" crossorigin="anonymous"></script>

3) Ad Slots:
- Replace the placeholder in components/AdSlot.jsx with your real <ins class="adsbygoogle" ...> element and push ads:
  <ins class="adsbygoogle"
       style="display:block"
       data-ad-client="YOUR-CLIENT-ID"
       data-ad-slot="YOUR-SLOT-ID"
       data-ad-format="auto"
       data-full-width-responsive="true"></ins>
  <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>

4) Ads.txt:
- If required, host an ads.txt file at the root of your frontend domain with entries provided by Google.

5) Policies:
- Ensure you comply with AdSense policies (placements, content, CLS, etc.). Avoid rendering ads on sensitive pages if not allowed.

## Plan-based Expiry Caps

- Anonymous (no account): up to 6 hours
- Logged-in Free: up to 24 hours
- Premium: up to 168 hours (1 week)
- The server clamps requested expiry to the plan’s maximum (env-configured) to enforce limits.

## Deployment

- Frontend (React + Vite + vanilla CSS): Deploy to Vercel (set VITE_API_BASE_URL to your backend URL).
- Backend (Express): Deploy to Render. Set environment variables from server/.env.example.
- Database: Use MongoDB Atlas. Ensure MONGODB_URI is configured.
- Files: Local storage for development; later switch to S3 by setting STORAGE_DRIVER=s3 and adding AWS_* vars.

## Remaining Notes

- Auto-logout after 1h is handled by JWT expiry and the AuthContext timer while preserving session on refresh within that period.
- Download/expiry limits: PINs remain valid until expiresAt and while downloadsCount < maxDownloads. One-time downloads and limits are enforced post-stream to avoid premature deletions.
- S3: A storage adapter can be added to utils/storage/s3.js for presigned uploads/downloads when moving large files to Amazon S3.
