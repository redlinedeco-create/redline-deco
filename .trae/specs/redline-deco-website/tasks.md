# REDLINE DECO Website - Implementation Plan

> **Status legend**
> - `complete` — the described code exists in the repository.
> - `pending` — not implemented.
>
> **`complete` does not mean the task's test requirements were verified.** The
> `rule` and `rubric` requirements below are manual and browser-based
> (responsive viewport testing, drag interaction, `prefers-reduced-motion`
> emulation, view-source inspection). They are unverified. Still to be run by
> hand: all 8 routes × 3 languages × 2 themes × 3 breakpoints (320 / 768 /
> 1280px), the before/after drag on pointer *and* touch, and every contact
> link/form flow.
>
> There is no automated test suite. The only automated checks are
> `npm run typecheck` and `npm run build`.

## Task 1: Initialize Next.js + TypeScript + Tailwind Project Scaffold
- **Status**: `complete`
- **Priority**: high
- **Depends On**: None
- **Description**:
  - Initialize Next.js 14+ app router project with TypeScript
  - Install and configure Tailwind CSS with custom theme (red/white/black palette)
  - Install shadcn/ui CLI and base components
  - Install Lucide icons
  - Configure project structure: /components, /app, /data, /types, /lib
  - Configure tsconfig.json strict mode
- **Acceptance Criteria Addressed**: AC-14, NFR-5
- **Test Requirements**:
  - `rule` TR-1.1: `npm run build` succeeds with zero TypeScript errors
  - `rule` TR-1.2: Directory structure contains /components, /app, /data, /types, /lib folders
  - `rule` TR-1.3: tailwind.config.ts includes custom red/black/white color tokens
  - `rubric` TR-1.4: Project scaffolding completeness; scale 1-5; anchors 1=bare minimum, 3=standard setup, 5=clean well-organized structure with all required folders and configs; threshold >= 4; evidence = file tree and config files
- **Notes**: Use `npx create-next-app@latest` with --ts --tailwind --app --no-src-dir --no-eslint options

## Task 2: Create Type Definitions and Data Models
- **Status**: `complete`
- **Priority**: high
- **Depends On**: Task 1
- **Description**:
  - Create /types/index.ts with all interfaces: Project, Category, Service, Price, Testimonial, ContactRequest
  - Create /data/projects.ts with mock portfolio data (6-8 sample projects across categories)
  - Create /data/categories.ts with portfolio categories (9 categories: all, drywall, ceilings, partitions, painting, decorative, renovation, commercial, residential)
  - Create /data/services.ts with 8 services
  - Create /data/pricing.ts with price items across 7 pricing categories
  - Create /data/testimonials.ts with placeholder testimonials
  - Create /lib/i18n.ts for multilingual translations (AR/FR/EN) for ALL UI text
- **Acceptance Criteria Addressed**: AC-10, FR-18, FR-5, FR-6, FR-8
- **Test Requirements**:
  - `rule` TR-2.1: All 6 interfaces defined in /types/index.ts match AC-10 field specifications exactly
  - `rule` TR-2.2: Data files exist under /data with correct TS types and no TypeScript errors
  - `rule` TR-2.3: i18n translations contain keys for all nav items, hero, services, portfolio categories, process steps, why-us items, form labels, contact info, footer, pricing disclaimer
  - `rubric` TR-2.4: Data organization quality; scale 1-5; anchors 1=types scattered, 3=basic structure, 5=clean separation, strict typing, comprehensive translations; threshold >= 4; evidence = type and data file review

## Task 3: Language Switcher + Theme Toggle (Core Utilities)
- **Status**: `complete`
- **Priority**: high
- **Depends On**: Task 2
- **Description**:
  - Create LanguageProvider context (React Context) managing current language, dir attribute on html, localStorage persistence
  - Create ThemeProvider context managing light/dark mode, localStorage persistence
  - Create LanguageSwitcher component (العربية | Français | English) for header/footer
  - Create ThemeToggle component (sun/moon icons) for header/footer
  - Create useTranslation() hook consuming i18n data
  - Create useDirection() hook for RTL-aware utilities
- **Acceptance Criteria Addressed**: AC-1, AC-2
- **Test Requirements**:
  - `rule` TR-3.1: Language context stores preference in localStorage under key 'language' and updates html dir="rtl" when Arabic selected
  - `rule` TR-3.2: Theme context stores preference in localStorage under key 'theme' and applies dark/light classes correctly
  - `rule` TR-3.3: useTranslation hook returns correct strings for all 3 languages
  - `rubric` TR-3.4: Context/provider implementation quality; scale 1-5; anchors 1=basic, 3=functional, 5=clean hooks, SSR-safe, well-typed; threshold >= 4; evidence = code review of providers and hooks

## Task 4: Header / Navigation (Sticky, Responsive, Shrinks on Scroll)
- **Status**: `complete`
- **Priority**: high
- **Depends On**: Task 3
- **Description**:
  - Create Header component: sticky positioning, responsive (desktop/tablet/mobile)
  - Desktop layout: Logo placeholder + 6 nav links (Home/Services/Work/Prices/About/Contact) + LanguageSwitcher + ThemeToggle + "Request a Quote" CTA button
  - Mobile layout: Hamburger menu, Logo, ThemeToggle, LanguageSelector; expanded mobile menu with all links
  - Shrink-on-scroll behavior using scroll listener
  - Logo area: "REDLINE DECO" + "PAINTING AND DRYWALLING" tagline
  - All nav items multilingual via useTranslation
- **Acceptance Criteria Addressed**: AC-3, FR-3
- **Test Requirements**:
  - `rule` TR-4.1: Header has position: sticky with top: 0; height transitions on scroll
  - `rule` TR-4.2: At viewport < 768px, hamburger menu appears; clicking opens mobile nav drawer with all 6 links + CTA
  - `rule` TR-4.3: All 6 nav items link to correct app routes: /, /services, /portfolio, /prices, /about, /contact
  - `rubric` TR-4.4: Header visual quality and responsiveness; scale 1-5; anchors 1=broken, 3=functional plain, 5=polished, smooth transitions, perfect mobile behavior, brand-appropriate; threshold >= 4; evidence = responsive browser testing

## Task 5: Footer Component
- **Status**: `complete`
- **Priority**: high
- **Depends On**: Task 3
- **Description**:
  - Create Footer component with:
    - REDLINE DECO brand + PAINTING AND DRYWALLING tagline
    - Quick links section (6 nav links)
    - Contact section: phone (0657387514), email (redlinedeco@gmail.com), location (SEBDOU-TLEMCEN, ALGERIA)
    - Social icons: Facebook, Instagram, WhatsApp
    - Language switcher
    - Theme switcher
    - Copyright: "© Redline Deco. All rights reserved."
  - All content multilingual
- **Acceptance Criteria Addressed**: FR-17
- **Test Requirements**:
  - `rule` TR-5.1: Footer contains all required sections (brand, quick links, contact, social, lang/theme switchers, copyright)
  - `rule` TR-5.2: Social icons link to placeholder URLs with correct WhatsApp/email/phone hrefs
  - `rubric` TR-5.3: Footer design quality; scale 1-5; anchors 1=messy, 3=standard, 5=clean responsive multi-column mobile-friendly layout; threshold >= 4; evidence = layout test

## Task 6: Hero Section
- **Status**: `complete`
- **Priority**: high
- **Depends On**: Task 3
- **Description**:
  - Create Hero component with:
    - Large professional construction/interior background imagery with subtle red treatment
    - Main headline in 3 languages
    - Supporting text in 3 languages
    - Primary CTA: "Request a Quote" (links to /quote)
    - Secondary CTA: "View Our Work" (links to /portfolio)
    - Trust badge: "Based in Sebdou, Tlemcen — Algeria"
  - Design: minimal text over image, left-aligned (LTR) / right-aligned (RTL)
- **Acceptance Criteria Addressed**: FR-4
- **Test Requirements**:
  - `rule` TR-6.1: All 3 headline + supporting text translations present and render correctly per language
  - `rule` TR-6.2: Both CTA buttons link to /quote and /portfolio routes
  - `rule` TR-6.3: Location trust statement present
  - `rubric` TR-6.4: Hero visual impact; scale 1-5; anchors 1=cheap template, 3=basic, 5=premium construction feel, strong red brand treatment, spacious professional layout; threshold >= 4; evidence = visual inspection

## Task 7: Services Section with 8 Service Cards
- **Status**: `complete`
- **Priority**: high
- **Depends On**: Task 2, Task 3
- **Description**:
  - Create ServiceCard reusable component: icon, title, short description, "Learn more" link
  - Create Services section component consuming services[] data
  - 8 services: Drywall Installation, False Ceilings, Partition Walls, Interior Painting, Decorative Painting, Wall Finishing, Renovation & Finishing, Custom Designs
  - All content multilingual (Arabic names from spec)
  - Layout: responsive grid (2/3/4 columns depending on breakpoint)
- **Acceptance Criteria Addressed**: FR-5, NFR-1
- **Test Requirements**:
  - `rule` TR-7.1: Exactly 8 service cards rendered with all required fields (icon/name/description/link)
  - `rule` TR-7.2: Service names render correctly in all 3 languages (matches spec Arabic names)
  - `rubric` TR-7.3: Service section design quality; scale 1-5; anchors 1=card overload, 3=basic cards, 5=minimal professional grid without over-carding, beautiful hover states; threshold >= 4; evidence = layout and visual review

## Task 8: Portfolio System (Filters, Cards, Project Detail Modal)
- **Status**: `complete`
- **Priority**: high
- **Depends On**: Task 2, Task 3
- **Description**:
  - Create PortfolioFilters component with category buttons (9 categories)
  - Create PortfolioCard component: large image, project name, category, location
  - Create ProjectDetail modal: hero image, title, location, category, description, services list, Before/After, gallery, Quote CTA
  - Create Portfolio section component (data-driven from projects[])
  - Create /portfolio page listing all projects with filters
  - Featured projects flag support (show featured on home, all on /portfolio)
- **Acceptance Criteria Addressed**: AC-4, FR-6
- **Test Requirements**:
  - `rule` TR-8.1: All 9 category filters exist and filter projects[] by category correctly
  - `rule` TR-8.2: Clicking PortfolioCard opens ProjectDetail modal with title/location/category/description/services/BeforeAfter/gallery/CTA
  - `rule` TR-8.3: /portfolio route renders full portfolio
  - `rule` TR-8.4: Featured flag filters correctly (only featured on homepage section)
  - `rubric` TR-8.5: Portfolio visual polish; scale 1-5; anchors 1=messy, 3=standard gallery, 5=beautiful masonry/grid, smooth filter transitions, high-quality card design; threshold >= 4; evidence = visual review and interactivity test

## Task 9: Before/After Interactive Slider Component
- **Status**: `complete`
- **Priority**: high
- **Depends On**: Task 3
- **Description**:
  - Create BeforeAfter component with draggable slider handle
  - Support desktop (pointer drag) and mobile (touch drag)
  - Show "BEFORE"/"AFTER" labels
  - Smooth drag animation with edge constraints
  - Placeholder before/after imagery from mock projects
- **Acceptance Criteria Addressed**: AC-5, FR-7
- **Test Requirements**:
  - `rule` TR-9.1: Slider handle can be dragged from 0% to 100% with pointer events on desktop
  - `rule` TR-9.2: Slider handle can be dragged with touch events on mobile viewport (< 430px)
  - `rule` TR-9.3: Before/After labels displayed
  - `rubric` TR-9.4: Slider UX quality; scale 1-5; anchors 1=sticky/jittery, 3=works basic, 5=smooth natural drag, nice visual handle, responsive; threshold >= 4; evidence = interactive drag testing

## Task 10: Why Choose Us Section + Process Section (Timeline)
- **Status**: `complete`
- **Priority**: medium
- **Depends On**: Task 3
- **Description**:
  - Create Why Choose Us section: 6 items with icons + titles + short descriptions (Professional Finishing, Attention to Detail, Clean Work, Customized Solutions, Clear Communication, Residential & Commercial Projects) - all 3 languages
  - Create Process section / How It Works: 6-step visual timeline (Contact Us → Discuss Project → Site Visit/Measurements → Receive Quote → Work Begins → Final Finishing) - numbered with connectors
- **Acceptance Criteria Addressed**: FR-13, FR-14
- **Test Requirements**:
  - `rule` TR-10.1: Exactly 6 "Why Choose Us" items with correct names in all 3 languages (matches spec Arabic)
  - `rule` TR-10.2: Exactly 6 process steps in correct order with visual timeline connector
  - `rubric` TR-10.3: Section design; scale 1-5; anchors 1=boring list, 3=basic sections, 5=beautiful timeline visual, iconography on-brand; threshold >= 4; evidence = visual inspection

## Task 11: Pricing Page + Data-Driven Pricing Display
- **Status**: `complete`
- **Priority**: high
- **Depends On**: Task 2, Task 3
- **Description**:
  - Create /prices page
  - Create PricingSection component consuming pricing[] data
  - 7 pricing categories: Drywall, False Ceilings, Partitions, Painting, Decorative Painting, Finishing, Other Services
  - Each item row: Service | Description | Unit | Price From-Price To | Notes | Last Updated
  - Pricing disclaimer in 3 languages
  - "Request a Custom Quote" CTA button
  - Create PricingPreview component for homepage (abbreviated version)
- **Acceptance Criteria Addressed**: AC-6, FR-8
- **Test Requirements**:
  - `rule` TR-11.1: /prices route exists and displays all 7 categories with structured items
  - `rule` TR-11.2: All pricing item fields render: service name, description, unit, priceFrom-priceTo range, notes, updatedAt
  - `rule` TR-11.3: Disclaimer text present in all 3 languages
  - `rule` TR-11.4: PricingPreview component present on homepage
  - `rubric` TR-11.5: Pricing page clarity and design; scale 1-5; anchors 1=confusing, 3=standard table, 5=clean readable grouped layout, professional pricing presentation; threshold >= 4; evidence = page content review

## Task 12: Quote Request Form (All Fields, Validation, Success, Integration Points)
- **Status**: `complete`
- **Priority**: high
- **Depends On**: Task 3
- **Description**:
  - Create QuoteForm component with all 12 fields:
    - Name (text)
    - Phone (tel)
    - Email (email)
    - Location (text)
    - Project Type (select: Residential/Commercial/Other)
    - Service Required (select/dropdown)
    - Approximate Area (number + unit)
    - Budget (optional, select/number)
    - Preferred Date (date)
    - Project Description (textarea)
    - Upload Photos (file, multiple, image/*)
    - Upload Plans/Documents (file, multiple, application/pdf, image/*)
  - Client-side validation (required fields)
  - Success message on submit
  - Submit handler with clear TODO comments for Email/WhatsApp/Database/Supabase/CRM integration
  - Create /quote page with this form + CTA
- **Acceptance Criteria Addressed**: AC-7, FR-9
- **Test Requirements**:
  - `rule` TR-12.1: All 12 form fields present with correct input types
  - `rule` TR-12.2: Required-field validation triggers on empty submit; prevents submission
  - `rule` TR-12.3: Successful (valid) submission displays clear success message
  - `rule` TR-12.4: Submit handler contains TODO comments for all 5 integrations (Email/WhatsApp/Database/Supabase/CRM)
  - `rubric` TR-12.5: Form UX quality; scale 1-5; anchors 1=crowded, 3=standard form, 5=beautiful spaced form, clear labels, file upload with preview, mobile-friendly; threshold >= 4; evidence = form submission test on mobile and desktop

## Task 13: Contact Page + WhatsApp Button + Mobile CTA Bar
- **Status**: `complete`
- **Priority**: high
- **Depends On**: Task 3
- **Description**:
  - Create floating WhatsAppButton component (fixed bottom-right, green WhatsApp branded, correct Algeria link format: wa.me/213657387514)
  - Create MobileCTABar component: fixed bottom on mobile viewport, 3 quick actions: WhatsApp, Call, Request Quote
  - Create ContactSection component: contact info (tel:0657387514, mailto:redlinedeco@gmail.com, WhatsApp, Sebdou-Tlemcen location), Call/WhatsApp/Email/Request-Quote buttons, contact form
  - Create /contact page with ContactSection + map placeholder ("Sebdou, Tlemcen, Algeria") + quote CTA
  - Add ContactSection to homepage
- **Acceptance Criteria Addressed**: AC-8, FR-10, FR-11
- **Test Requirements**:
  - `rule` TR-13.1: WhatsApp button href is `https://wa.me/213657387514` (Algeria +213, no leading zero)
  - `rule` TR-13.2: Phone links use tel:0657387514; Email uses mailto:redlinedeco@gmail.com
  - `rule` TR-13.3: /contact page exists with info, form, map placeholder, CTA
  - `rule` TR-13.4: MobileCTABar visible only at mobile breakpoint (< 640px / 768px)
  - `rule` TR-13.5: Floating WhatsApp button visible on all viewports
  - `rubric` TR-13.6: Contact system usability; scale 1-5; anchors 1=missing features, 3=works, 5=easy access everywhere, prominent WhatsApp, intuitive mobile actions; threshold >= 4; evidence = button click test on all viewports

## Task 14: About Section + Testimonials Section + CTA Section
- **Status**: `complete`
- **Priority**: medium
- **Depends On**: Task 3
- **Description**:
  - Create About section with provided exact copy in all 3 languages (no invented stats)
  - Create /about page with About section + Why Choose Us + Process
  - Create Testimonials section with clearly-marked placeholder content ("Client testimonial will appear here."), not inventing real reviews
  - Create reusable CTA/QuoteRequest section for middle and bottom of pages
- **Acceptance Criteria Addressed**: FR-12, FR-20, FR-19
- **Test Requirements**:
  - `rule` TR-14.1: About section copy exactly matches spec English/French/Arabic copy; no additional invented claims
  - `rule` TR-14.2: /about route exists
  - `rule` TR-14.3: Testimonials section explicitly shows placeholder text (no fake customer names/reviews)
  - `rubric` TR-14.4: Sections visual quality; scale 1-5; anchors 1=plain blocks, 3=standard, 5=beautiful layout, testimonials placeholder clearly indicated; threshold >= 4; evidence = text verification and visual review

## Task 15: Gallery Section with Lightbox
- **Status**: `complete`
- **Priority**: medium
- **Depends On**: Task 8
- **Description**:
  - Create GallerySection component: masonry-style image grid
  - Gallery filters: All, Drywall, Painting, Ceilings, Partitions, Renovation
  - Lightbox modal: click image to open, zoom, prev/next navigation, captions, category
  - Images drawn from project image pools in data
- **Acceptance Criteria Addressed**: FR-15
- **Test Requirements**:
  - `rule` TR-15.1: 5 gallery filter buttons exist; filtering works
  - `rule` TR-15.2: Clicking gallery image opens lightbox with prev/next nav
  - `rule` TR-15.3: Lightbox displays caption and category
  - `rubric` TR-15.4: Gallery quality; scale 1-5; anchors 1=basic grid, 3=standard gallery, 5=beautiful masonry, smooth lightbox transitions; threshold >= 4; evidence = interactive test

## Task 16: Admin Dashboard UI (/admin Route - Demo Only)
- **Status**: `complete`
- **Priority**: low
- **Depends On**: Task 4, Task 5, Task 2
- **Description**:
  - Create /admin route page with Header/Footer
  - Add prominent, highly visible disclaimer banner in RED: "DEMO MODE - This admin UI is NOT production secure. Authentication and backend are required for real use."
  - Admin UI sections:
    - Projects: Add / Edit / Delete project table with featured toggle
    - Categories: Add / Edit / Delete categories table
    - Services: Add / Edit / Delete services table
    - Prices: Edit prices table
    - Upload Images area (UI only - no real upload)
  - No actual auth; all forms are mock UI
- **Acceptance Criteria Addressed**: AC-11, FR-18
- **Test Requirements**:
  - `rule` TR-16.1: /admin route exists and renders
  - `rule` TR-16.2: Prominent disclaimer is visible above all other admin content (not hidden or small)
  - `rule` TR-16.3: All 5 management area UIs present (Projects CRUD, Categories CRUD, Services CRUD, Price Edit, Uploads)
  - `rubric` TR-16.4: Admin UI quality; scale 1-5; anchors 1=broken, 3=basic, 5=clean table/dashboard layout, demo disclaimer clearly visible; threshold >= 4; evidence = /admin page visit and review

## Task 17: All App Routes Setup + SEO Metadata
- **Status**: `complete`
- **Priority**: high
- **Depends On**: Task 4, Task 5, Tasks 6-16
- **Description**:
  - Create app routes:
    - / (Homepage with all 11 sections in order per NFR-9)
    - /services
    - /portfolio
    - /prices
    - /about
    - /contact
    - /quote
    - /admin
  - Configure global SEO via generateMetadata or Next.js Metadata API:
    - Title: "Redline Deco | Painting & Drywalling | Sebdou - Tlemcen"
    - Meta description per spec
    - OpenGraph tags (og:title, og:description, og:type, og:image placeholder)
  - Ensure every page has proper H1/H2/H3 hierarchy
  - Add alt text to all images (multilingual where appropriate)
  - Configure favicon metadata
- **Acceptance Criteria Addressed**: AC-9, AC-15, FR-19, NFR-9
- **Test Requirements**:
  - `rule` TR-17.1: All 8 routes are reachable and render correct page content
  - `rule` TR-17.2: Homepage section order exactly matches NFR-9 (1.Header 2.Hero 3.Services 4.Featured Projects 5.Before/After 6.Why Redline Deco 7.Work Process 8.Pricing Preview 9.CTA 10.Testimonials 11.Contact 12.Footer) via DOM order
  - `rule` TR-17.3: Page source <title> exactly matches specified string; meta description present; og tags present
  - `rule` TR-17.4: All img elements have non-empty alt attributes
  - `rubric` TR-17.5: SEO comprehensiveness; scale 1-5; anchors 1=missing basics, 3=basic title, 5=full metadata, sitemap-ready structure, semantic headings; threshold >= 4; evidence = view-source inspection

## Task 18: Animations, Accessibility, prefers-reduced-motion
- **Status**: `complete`
- **Priority**: medium
- **Depends On**: All prior tasks (1-17)
- **Description**:
  - Add subtle animations: Intersection Observer-based fade-in, slide-up
  - Image reveal animations on scroll
  - Hover effects on cards/buttons
  - Smooth scroll behavior
  - Portfolio category filter transitions
  - Before/after slider animation polish
  - Wrap all animations with `prefers-reduced-motion` media query respect
  - Add accessibility:
    - Proper aria-labels on icon-only buttons (theme toggle, hamburger, language switcher)
    - Focus styles on all interactive elements
    - Semantic HTML: <header>, <nav>, <main>, <section>, <article>, <footer>, <address>
    - Skip-link or logical tab order
    - Form label associations
- **Acceptance Criteria Addressed**: NFR-3, NFR-4, FR-25
- **Test Requirements**:
  - `rule` TR-18.1: prefers-reduced-motion media query disables non-essential animations (test via Chrome DevTools emulate feature)
  - `rule` TR-18.2: All icon-only buttons have aria-label attributes
  - `rule` TR-18.3: Semantic HTML tags used (<header>, <nav>, <main>, <footer>, <section> at minimum)
  - `rule` TR-18.4: Form inputs have associated <label> via htmlFor/id or wrapping
  - `rubric` TR-18.5: Animation and accessibility quality; scale 1-5; anchors 1=none, 3=basic transitions, 5=subtle professional animations, comprehensive a11y, motion-respect; threshold >= 4; evidence = a11y audit and animation visual review

## Task 19: Build Verification, Type Check, Lint, Final Quality Review
- **Status**: `complete`
- **Priority**: high
- **Depends On**: All tasks (1-18)
- **Description**:
  - Run npm run build and fix all errors
  - Run TypeScript strict type check
  - Run Next.js lint (if configured)
  - Manual visual QA: all 8 routes, all 3 languages, both themes, all breakpoints (320px mobile, 768px tablet, 1280px desktop)
  - Verify RTL behavior for Arabic across all pages
  - Test all form flows
  - Test all contact link formats
- **Acceptance Criteria Addressed**: ALL ACs
- **Test Requirements**:
  - `rule` TR-19.1: `npm run build` completes with exit code 0
  - `rule` TR-19.2: `npx tsc --noEmit` returns zero errors
  - `rule` TR-19.3: No console errors on page load across any route/language/theme
  - `rubric` TR-19.4: Overall final quality; scale 1-5; anchors 1=broken, 3=passable, 5=polished production-ready professional website meeting all specs; threshold >= 4; evidence = comprehensive checklist review
