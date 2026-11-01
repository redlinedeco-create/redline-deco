# Redline Deco — Website

Marketing website for **Redline Deco**, a painting, drywalling and interior finishing
company based in Sebdou, Tlemcen, Algeria.

Trilingual (English / French / Arabic with full RTL), light + dark themes, and
data-driven so the owner can change content without touching components.

---

## Stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (`strict`) |
| Styling | Tailwind CSS 3.4 + PostCSS |
| Icons | `lucide-react` |
| Class merging | `clsx` + `tailwind-merge` (via `cn()`) |
| i18n | Hand-rolled React Context — no i18n library |
| Theming | React Context + `darkMode: "class"` + HSL CSS variables |
| Backend | Supabase (Postgres + Auth + Storage) through `/api/*` route handlers |

The design system follows the shadcn/ui token convention (HSL variables in
`app/globals.css` mapped in `tailwind.config.ts`), but the components are
hand-rolled rather than pulled from the shadcn CLI. `class-variance-authority`
is not required.

---

## Getting started

Requires **Node.js 20+** and npm.

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

---

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run dev:lan` | Dev server bound to `0.0.0.0` (local + LAN) |
| `npm run preview` | Production server bound to `0.0.0.0` (local + LAN) |
| `npm run build` | Production build (also type-checks) |
| `npm run start` | Serve the production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint via `next lint` |

There is no automated test suite. The spec's test requirements are manual /
browser-based — see `.trae/specs/redline-deco-website/tasks.md`.

### Preview on your LAN

Use the helper script: it rebuilds whenever any source file is newer than
`.next\BUILD_ID`, then serves the **production** build on all interfaces.

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\preview.ps1
```

Any device on your network can then open `http://<this-machine-ip>:3000`
(for example `http://192.168.1.3:3000`). Output is appended to
`$env:TEMP\redline-preview.log`.

Stop it by killing the processes bound to port 3000:

```powershell
netstat -ano | findstr ":3000" | findstr "LISTENING"
Stop-Process -Id <pid> -Force
```

Prefer the production preview for phones/tablets: `next dev` can take
minutes to compile a cold page, which shows up on a phone as a blank or
half-styled page. Use `npm run dev:lan` only while editing, and re-run
`npm run build` (or just restart `scripts\preview.ps1`) after every change.

Windows Firewall blocks the port until you add this once, from an
**elevated** terminal:

```powershell
New-NetFirewallRule -DisplayName "Redline Deco preview (TCP 3000)" `
  -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow `
  -Profile Public -RemoteAddress LocalSubnet
```

The rule is scoped to your subnet and TCP 3000 only. Undo it with
`Remove-NetFirewallRule -DisplayName "Redline Deco preview (TCP 3000)"`.

---

## Project structure

```
app/
  layout.tsx           Root layout: metadata, providers, Header/Footer, floating CTAs
  page.tsx             Home (section order is fixed by NFR-9 — see spec)
  not-found.tsx        Branded 404
  error.tsx            Error boundary
  opengraph-image.tsx  Generated OG image (no binary asset needed)
  sitemap.ts robots.ts Generated sitemap.xml / robots.txt
  about/ services/ portfolio/ prices/ contact/ quote/ admin/
  api/
    quote/             Public POST that stores an enquiry (quote or contact form)
    admin/             Authenticated CRUD + the enquiry inbox + media uploads
components/            Named exports, all "use client"
data/                  All editable content (projects, services, prices, categories)
lib/
  i18n.ts              Every user-facing string, in all 3 languages
  quote.ts             Shared enquiry validation, limits and helpers
  adminApi.ts          Browser wrappers over /api/admin
  admin/               Session + service-role guards for the admin routes
  utils.ts             cn() helper + CONTACT_INFO
  providers/           LanguageProvider (language + dir) and ThemeProvider
supabase/schema.sql    Tables, RLS, buckets — run this in the SQL editor
types/index.ts         Project, Category, ServiceItem, Price, Testimonial, ContactRequest
public/                Static assets
```

Convention: **all user-facing strings go through `t()`** — see
[Editing content](#editing-content).

---

## Enquiries (quote + contact)

Both forms POST to `/api/quote`, which validates again server side, rate limits
by IP, stores the row in `contact_requests`, and drops any attached photos or
plans into the **private** `quote-attachments` bucket.

The visitor then gets a reference (`RD-XXXXXX`) to quote on the phone, and the
enquiry shows up in **`/admin` → Requests**, where it can be moved through
`new → in progress → won / lost`, annotated with a private note, replied to by
email or WhatsApp, and deleted (which also deletes the customer's files).

Two things are deliberate:

- The **anon key cannot write** to that table. All writes go through
  `app/api/quote/route.ts`; the admin routes additionally require a session and
  `SUPABASE_SERVICE_ROLE_KEY`.
- If the deployment has no service-role key, the forms **do not fake a
  success** — they show the message pre-filled for WhatsApp and email instead.

Setup steps live in [`SETUP.md`](./SETUP.md).

---

## Editing content

You should not need to touch a component to change content.

### 1. Projects, services, prices, categories

Edit the files in `data/`. They are typed arrays of the interfaces in
`types/index.ts`, so TypeScript will catch mistakes.

| File | Export | Interface |
| --- | --- | --- |
| `data/projects.ts` | `projects` | `Project` |
| `data/categories.ts` | `categories` | `Category` |
| `data/services.ts` | `services` | `ServiceItem` |
| `data/pricing.ts` | pricing data | `Price` |
| `data/testimonials.ts` | `testimonials` | `Testimonial` |

Localized fields are inline objects, e.g.:

```ts
{
  id: "p1",
  title: {
    en: "Modern Apartment Interior",
    fr: "Intérieur d'appartement moderne",
    ar: "شقة حديثة",
  },
  // ...
}
```

Adding a project, category or service requires **no component changes** — the
filter buttons, cards and galleries all read from these arrays.

> **Do not invent facts.** No fake testimonials, awards, years of experience,
> project counts, staff numbers or street addresses. Testimonials ship as
> clearly-marked placeholders and prices are indicative ranges, per the spec's
> business constraints.

### 2. Text and translations

Every string lives in `lib/i18n.ts` as a nested dictionary keyed by language:

```ts
en: { nav: { home: "Home" }, ... }
fr: { nav: { home: "Accueil" }, ... }
ar: { nav: { home: "الرئيسية" }, ... }
```

Components read it with `useTranslation()`:

```tsx
const { t, dir, language } = useTranslation();
t("nav.home");
```

`dir` is `"rtl"` for Arabic and drives icon flipping and alignment. If you add a
key, add it to **all three** languages.

### 3. Contact details

Phone, email, WhatsApp and location are centralized in `CONTACT_INFO` in
`lib/utils.ts` — change them there and they update site-wide, including the
floating WhatsApp button and mobile CTA bar.

The WhatsApp link uses the Algerian international format with no leading zero:
`https://wa.me/213657387514`.

### 4. Brand colours and theming

- Brand palette: `brand.red.50`–`900` in `tailwind.config.ts` (default `#B91C1C`).
- Semantic tokens (`--background`, `--foreground`, `--card`, `--muted`,
  `--border`, …) are HSL variables in `app/globals.css`, defined for `:root` and
  `.dark`. Prefer these over raw colours so both themes keep working.

### 5. Images

Project and gallery images are remote URLs in the `data/` files, currently
served from `coresg-normal.trae.ai`. If you move to your own host or to local
files in `public/`, add the host to `images.remotePatterns` in
`next.config.mjs` — the allowlist is intentionally explicit rather than a
wildcard.

---

## Deploying

Target is **Netlify**.

1. Push the repository to GitHub/GitLab.
2. In Netlify, add the repo. `netlify.toml` already sets the build command,
   Node version, the Next.js runtime plugin, cache headers and baseline
   security headers.
3. Update the canonical domain in `CONTACT_INFO.website` (`lib/utils.ts`) —
   `metadataBase`, `sitemap.xml` and `robots.txt` all derive from it.

---

## Not implemented

These are deliberate, per the spec's non-goals. They are **not** bugs:

- **No email delivery.** Enquiries are stored in the database and answered
  from `/admin`. Nothing mails the visitor automatically — replying is a
  click-to-open `mailto:` / WhatsApp link.
- **Testimonials and the map are placeholders.**
- **QR code area is a placeholder.**
- `/admin` is excluded from indexing (`robots` noindex + disallowed in
  `robots.txt`).

---

## Requirements

The authoritative requirements live in
`.trae/specs/redline-deco-website/`:

- `spec.md` — PRD, functional requirements (FR-1…FR-20), non-functional
  requirements (NFR-1…NFR-9) and acceptance criteria (AC-1…AC-15)
- `tasks.md` — implementation plan with per-task test requirements
