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
| Backend | **None.** Demo only — see [Not implemented](#not-implemented) |

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
| `npm run build` | Production build (also type-checks) |
| `npm run start` | Serve the production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint via `next lint` |

There is no automated test suite. The spec's test requirements are manual /
browser-based — see `.trae/specs/redline-deco-website/tasks.md`.

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
components/           22 components, all named exports, all "use client"
data/                 All editable content (projects, services, prices, categories)
lib/
  i18n.ts             Every user-facing string, in all 3 languages
  utils.ts            cn() helper + CONTACT_INFO
  providers/          LanguageProvider (language + dir) and ThemeProvider
types/index.ts        Project, Category, ServiceItem, Price, Testimonial, ContactRequest
public/               Static assets
```

Convention: **all user-facing strings go through `t()`** — see
[Editing content](#editing-content).

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

- **No backend.** Quote and contact forms validate and show a success message
  client-side only. The submit handler in `components/QuoteForm.tsx` has
  explicit `TODO` markers for Email, WhatsApp, database, Supabase and CRM
  integration.
- **`/admin` is a demo.** It is a UI mockup with no authentication and is
  excluded from indexing (`robots` noindex + disallowed in `robots.txt`). It is
  **not** production-secure — do not put real data behind it.
- **Testimonials and the map are placeholders.**
- **QR code area is a placeholder.**

---

## Requirements

The authoritative requirements live in
`.trae/specs/redline-deco-website/`:

- `spec.md` — PRD, functional requirements (FR-1…FR-20), non-functional
  requirements (NFR-1…NFR-9) and acceptance criteria (AC-1…AC-15)
- `tasks.md` — implementation plan with per-task test requirements
