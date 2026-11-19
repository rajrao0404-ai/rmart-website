R MART — Razorpay Standard Checkout update

WHAT CHANGED
- UPI checkout uses Razorpay Standard Checkout (not a UPI deep link).
- Cloudflare Pages Functions:
  - POST /api/create-order
  - POST /api/verify-payment
  - GET /api/razorpay-config
- COD flow remains available.
- UPI orders are written to Firebase only after the backend verifies the Razorpay signature.
- Existing customer, admin, delivery, catalog, cart and ₹28 / ₹499 delivery logic are retained.

SECURITY — IMPORTANT
The Razorpay Key Secret previously pasted into chat should be treated as exposed. Regenerate/rotate it in Razorpay Dashboard before configuring this project. Do NOT put the Key Secret in index.html, any frontend file, or a committed .env file.
No real credentials are included in this ZIP. .env.example is only a template.

DEPLOYMENT NOTE
This project was a static Cloudflare Pages site. Razorpay Standard Checkout requires server-side endpoints, so the ZIP now includes Cloudflare Pages Functions in /functions. Uploading only the HTML files with the Cloudflare dashboard's static drag-and-drop flow may not deploy Functions. Deploy with Wrangler so the /functions folder is included.

1) On a computer with Node.js, unzip this folder and open a terminal in it.
2) Install Wrangler:
   npm install
3) Log in:
   npx wrangler login
4) Set the credentials as Cloudflare Pages secrets (use the NEW rotated secret):
   npx wrangler pages secret put RAZORPAY_KEY_ID --project-name r-mart
   npx wrangler pages secret put RAZORPAY_KEY_SECRET --project-name r-mart
   Enter each value when prompted. Never paste the secret into a source file.
5) Deploy this folder:
   npx wrangler pages deploy . --project-name r-mart

If your Cloudflare Pages project has a different project name, replace r-mart with its exact project name.
If using Git-based Pages deployment instead, commit this folder including /functions, then add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET under Cloudflare Pages > Settings > Variables and Secrets, and redeploy.

TESTING
- The Key ID supplied earlier was a test key. After rotating/creating test credentials in Razorpay, set the test Key ID and test Key Secret as Cloudflare secrets.
- Open the deployed R MART website, add products, choose Pay via UPI, fill customer details and Place Order.
- Razorpay test checkout should open. Use Razorpay's current test payment details from its official test-mode documentation.
- Confirm a successful test payment creates an order with paymentStatus "Paid" in Firebase.
- Test a dismissed/failed payment; it must not create a paid order.
- Before accepting real customer payments, finish Razorpay KYC/website approval and replace both Cloudflare secrets with LIVE credentials, then redeploy if needed.

MANUAL / BUSINESS STEPS
- Razorpay account activation and KYC approval are controlled by Razorpay; code cannot activate the merchant account.
- Confirm the statement/brand name in Razorpay Dashboard. UPI app beneficiary display can still depend on bank/account verification.
- The server verifies the payment signature. For production-grade fulfillment, also configure Razorpay webhooks and reconcile payment/order status server-side.
