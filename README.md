# Reagaleano — website, owner panel and technician app

One Next.js 16 (App Router, TypeScript) project with three surfaces on one backend:

| Surface | URL | Who |
|---|---|---|
| Public website: Home, About us, Services, Projects (appears once the owner adds one), Contact us (request form) | `/`, `/about`, `/services`, `/projects`, `/contact` | Clients |
| Owner panel: requests inbox, price list, quote builder + PDF, jobs, technicians, analytics, settings | `/owner/...` | Owner |
| Technician app (mobile-first, deliberately minimal): the jobs allocated to them, with the client's address and phone (Call / WhatsApp / Navigate), scope, materials, and Mark complete | `/tech/...` | Technicians |
| Staff login / forced password change | `/login`, `/account/password` | Staff |

## Run it

Requires **Node 22.13 or newer** (uses Node's built-in SQLite, so there is nothing to compile and no Visual Studio / Python needed).
On Windows, keep the project in a short path outside Downloads (for example `C:\dev\reagaleano`) and delete any old `node_modules` folder first;
antivirus and Downloads-folder protection can block npm from writing files.

```bash
npm install
cp .env.example .env.local      # then fill in SESSION_SECRET, OWNER_EMAIL, OWNER_PASSWORD
npm run dev                     # http://localhost:3000
```

On first start the database (`data/reagaleano.db`, SQLite via `node:sqlite`; Node prints a harmless "experimental" warning) is created, the owner account is created from
`OWNER_EMAIL` / `OWNER_PASSWORD`, and a starter price list is loaded. Sign in at `/login`.
Production: `npm run build && npm start`. Generate the secret with `openssl rand -base64 48`.

## The flow

Client submits the Contact form → owner sees it in **Requests** (email notification if `RESEND_API_KEY` is set) →
**Create quote** from the request → build the quote from the **Price list** (materials at cost + markup, labour as flat tasks) →
**Issue** (locks it) → **Preview / download PDF** (browser print → Save as PDF) → owner sends it himself →
**Mark accepted** → a job is created (materials copied **without prices**, client address and phone copied across from the request or quote) →
owner **assigns a technician** → the technician opens the job on their phone, calls or navigates to the client, and marks it complete. Only the owner can reopen a job.

## Public website

Structure inspired by established electrical-contractor sites: an info bar (call number, 24-hour support, optional office hours, Contact now),
a rotating hero with a call to action, audience tiles, a highlights strip, a services grid, a project gallery, brands, how-it-works, FAQ and an
appointment form. Nothing is invented: the highlights strip starts with facts from the company profile (registered 2016, Level 1 B-BBEE, 135%
procurement recognition, 24-hour support) and the owner replaces or adds real numbers under **Settings → Public website**. The gallery and brands
sections only appear once the owner adds **Projects** (with photo upload) or brands. The website phone number and email are separate from the quote
letterhead, so the two can differ.

Photo uploads: JPG/PNG/WebP up to 5 MB, type checked from the file bytes (SVG and renamed files are rejected), stored under `data/uploads`
(or `UPLOAD_DIR`) with random names and served with long-term caching; images are resized by Next.js when shown.

## Quote builder, analytics and settings

- **Quotations** (`/owner/quotes`): card list in the style of KasiTrade (customer, status, number and dates, total, Edit / Print / Delete on drafts).
  **+ New Quotation** creates a draft for any customer; **Create quote** on a request prefills it.
- **Quote editor** (`/owner/quotes/[id]`): no Save buttons. Everything you type recalculates totals instantly (quantity × price, discount, VAT, margin)
  and autosaves about 0.7 s after your last change, with a "Saving… / All changes saved" indicator. Pick an item from the price list in the
  description box to fill its unit and price, or type a custom item. The live document preview on the right updates as you type. **Issue quote**
  saves, then locks it; the PDF page's title is the quote number, so "Save as PDF" suggests `RGL-CCTV-290826`.
  The server takes item costs from the price list (never from the browser) and clamps all numbers.
- **Products & Services** (`/owner/prices`), request status, job assignment and the client contact fields on a job also save themselves on change.
- **Analytics** (`/owner/analytics`, range: 30 / 90 days / 12 months / all): requests, quotes issued, win rate, accepted value,
  average quote, margin on costed materials, time to quote and to decision; requests per week; accepted value per month;
  request → quoted → issued → accepted funnel; requests by service and property type; technician comparison table.
- **Per-technician analytics** (`/owner/analytics/technicians/[id]`): jobs assigned/completed/open, completion rate, average time from assignment to completion, completed value, and a job list.
- **Settings** (`/owner/settings`): letterhead, brand colour, banking details, default validity and terms. Stored in the database and
  used on every quote (environment variables are only the starting defaults).

## Security decisions

- Passwords are bcrypt-hashed. Sessions are signed JWT cookies (httpOnly, sameSite=lax, secure in production).
  Every request re-checks the user in the database, so deactivating a technician or resetting a password
  (`token_version`) revokes their sessions immediately.
- Owner adds technicians and gets a temporary password **once**; only the hash is stored; the technician must change it at first sign-in.
  Technicians are deactivated, never deleted, so job history is kept.
- Authorisation is enforced on the server in every layout **and** every server action (`requireRole`), not just hidden in the UI.
- Technician data comes only from `src/lib/tech.ts`, whose queries never select cost, markup, price or totals.
  Job materials are stored in their own table without prices. Technician actions also verify the job is assigned to them.
- Quotes: prices are copied into quote lines (later price-list edits don't change old quotes); numbers (`RGL-CCTV-290826`, `-02` on same-day
  collisions) are generated server-side in a transaction; issued quotes are locked.
- Public form: honeypot field, per-IP rate limit, server-side validation, POPIA consent checkbox required.
  Login is rate-limited per IP + email. (Limiters are in-memory: fine for one server; use Redis if you scale out.)
- Banking details are **not** in the code. Set `BANK_*` in the environment; they print on the quote PDF only if set.

## Not built yet (deliberately)

Photo upload, quote revisions (Q-0042 rev 2), invoicing/accounting, WhatsApp notifications, CSV price import,
maintenance schedules and reports. SQLite suits a single VPS/Render disk; for serverless hosting (e.g. Vercel) move
`src/lib/db.ts` to Postgres. Add real photos, the logo, and per-page SEO copy before launch.

## Layout

```
src/lib/        db (schema + seed), session, auth, money, content (services/FAQ), tech (technician-safe queries)
src/app/(site)  public pages        src/app/owner  owner panel + actions      src/app/tech  technician app
src/app/print   quotation document  src/app/login  staff sign-in             src/components shared UI
```
