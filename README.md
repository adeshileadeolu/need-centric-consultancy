# Need-Centric Consultancy website (React + Vite)

Live domain: https://needcentricconsultancy.org

## Run locally
    npm install
    npm run dev          # serves the site AND the /api functions (forms, Quick Assessment) in dev mode

## Deploy: GitHub → Vercel

1. **Push to GitHub**
   ```
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/<your-username>/need-centric-consultancy.git
   git push -u origin main
   ```

2. **Import into Vercel**
   - vercel.com → Add New → Project → select the repo.
   - Framework preset: Vite (auto-detected). Build command `npm run build`, output `dist` (auto-filled).

3. **Add environment variables** (Project → Settings → Environment Variables) **before** your first real deploy, or redeploy after adding them:
   - `RESEND_API_KEY`, `NOTIFY_EMAIL`, `FROM_EMAIL` — required for the Assessment, Proposal and Consultation forms to actually send you an email (via https://resend.com — verify your sending domain there first).
   - `PSI_API_KEY` — optional; raises the Google PageSpeed quota used by the Quick Assessment's Speed tab.
   - `VITE_CONTACT_EMAIL`, `VITE_WHATSAPP`, `VITE_WHATSAPP_URL`, `VITE_TELEGRAM_URL`, `VITE_X_URL`, `VITE_BOOKING_URL`, `VITE_GA_ID` — public-facing contact/social links and analytics ID.

4. **Connect the domain**
   - Project → Settings → Domains → Add → `needcentricconsultancy.org` (and `www.needcentricconsultancy.org`).
   - Vercel shows the exact A/CNAME records to add at your registrar's DNS panel.
   - SSL is issued automatically once DNS resolves — no action needed.

5. **After adding env vars**, trigger a redeploy (Vercel → Deployments → ⋯ → Redeploy) so the forms and assessment pick them up.

## Architecture
Content lives in `src/data.js`; pages and components in `src/App.jsx`; styles in `src/styles.css`. `api/enquiry.js` emails form submissions via Resend; `api/assess.js` and `api/speed.js` power the Quick Assessment (site analysis + Google PageSpeed).
