# REDLINE DECO Website - Product Requirements Document

## Overview
- **Summary**: Build a complete, production-quality multilingual business website for REDLINE DECO, a construction/decor company specializing in painting, drywalling, false ceilings, partitions, and interior finishing, based in Sebdou, Tlemcen, Algeria.
- **Purpose**: Provide a professional online presence that showcases services, portfolio of work, pricing, and enables easy contact via WhatsApp, phone, email, and quote request forms for local Algerian clients.
- **Target Users**: Residential and commercial property owners/decision-makers in Sebdou, Tlemcen, and surrounding areas of Algeria seeking professional drywall, painting, and interior finishing services. Users speak Arabic, French, or English.

## Goals
- Establish a trustworthy, professional brand presence online
- Showcase portfolio of completed projects with before/after visuals
- Clearly communicate services, pricing ranges, and value proposition
- Enable easy contact via WhatsApp (primary), phone, email, and quote form
- Support 3 languages with proper RTL for Arabic
- Provide dark/light theme toggle for better UX
- Structure content to be easily manageable without code edits in future

## Non-Goals
- Backend authentication system (admin UI is demo/mock only)
- Real database integration (Supabase connection points added but not live)
- Real customer testimonials (placeholder only)
- Exact street address map placement (placeholder only)
- Fake statistics (no invented years experience, project counts, etc.)
- QR code recreation (placeholder area only)

## Background & Context
- REDLINE DECO specializes in: Drywall installation, Plasterboard/gypsum board, False ceilings, Partition walls, Wall finishing, Interior painting, Decorative painting, Renovation/interior finishing, Custom drywall designs
- Brand colors: Strong construction red (primary), white (secondary), black/charcoal (text), lighter red (accent)
- Visual language: Professional construction aesthetic, not cartoonish; illustrated workers used sparingly as branding elements
- Contact: Phone 0657387514, Email redlinedeco@gmail.com, Location Sebdou-Tlemcen, Algeria
- Tech stack: Next.js, TypeScript, Tailwind CSS, shadcn/ui, Lucide icons

## Functional Requirements
- **FR-1**: 3-language support (Arabic/FR/EN) with full RTL layout for Arabic, language switcher in header and footer
- **FR-2**: Dark/Light mode toggle with localStorage persistence, visible switch in header and footer
- **FR-3**: Sticky responsive header with logo, nav (Home/Services/Work/Prices/About/Contact), language switcher, theme toggle, "Request a Quote" CTA, hamburger menu on mobile, shrinks on scroll
- **FR-4**: Hero section with multilingual headline, supporting text, 2 CTAs (Quote + View Work), trust statement (Sebdou, Tlemcen location)
- **FR-5**: Services section: 8 services (Drywall, False Ceilings, Partitions, Interior Painting, Decorative Painting, Wall Finishing, Renovation, Custom Designs) each with icon, name, description, Learn More link
- **FR-6**: Portfolio system: filterable categories (All/Drywall/Ceilings/Partitions/Painting/Decorative/Renovation/Commercial/Residential), project cards with image/name/category/location, expandable project detail (modal or page) with hero, description, services, before/after, gallery, CTA. Data-driven architecture.
- **FR-7**: Interactive Before/After slider component, mobile-friendly
- **FR-8**: Dedicated Prices page with data-model structure, categories (Drywall/Ceilings/Partitions/Painting/Decorative/Finishing/Other), items with service/description/unit/priceFrom/priceTo/notes/updatedAt, disclaimer, CTA
- **FR-9**: Quote request form with fields: Name, Phone, Email, Location, ProjectType (Residential/Commercial/Other), Service, Approx Area, Budget (optional), Preferred Date, Description, Photo upload, Document upload; success message; clear backend integration points
- **FR-10**: Floating WhatsApp button; floating mobile CTA bar (WhatsApp/Call/Quote)
- **FR-11**: Contact page with info (phone/email/WhatsApp/location), contact form, quote CTA, map placeholder
- **FR-12**: About section with provided professional copy (3 languages)
- **FR-13**: Why Choose Us section: 6 points (Professional Finishing, Attention to Detail, Clean Work, Customized Solutions, Clear Communication, Residential & Commercial)
- **FR-14**: Process section (How It Works): 6-step visual timeline (Contact → Discuss → Site Visit/Measurements → Quote → Work Begins → Final Finishing)
- **FR-15**: Gallery section with masonry layout, filters, lightbox with zoom/nav/captions
- **FR-16**: Testimonials section with clearly marked placeholders
- **FR-17**: Footer with brand, quick links, contact info, social icons (Facebook/Instagram/WhatsApp), language/theme switchers, copyright
- **FR-18**: Admin /admin route UI mockup for content management (Projects/Categories/Services/Prices CRUD), clearly marked demo/not secure
- **FR-19**: SEO: proper H1/H2/H3, alt text, OpenGraph, title "Redline Deco | Painting & Drywalling | Sebdou - Tlemcen", meta description
- **FR-20**: Data models for Projects, Categories, Services, Prices, Testimonials, ContactRequests structured for future Supabase integration

## Non-Functional Requirements
- **NFR-1**: Fully responsive: desktop/tablet/mobile, no horizontal scroll on mobile
- **NFR-2**: Professional, modern, minimal design with spacious layouts, large imagery, strong typography, moderate rounded corners, red accents, subtle animations
- **NFR-3**: Subtle animations: fade-in, slide-up, image reveal, hover, smooth scroll, portfolio transitions, before/after slider; respects prefers-reduced-motion
- **NFR-4**: Accessibility: semantic HTML, keyboard nav, labels, focus states, alt text, good contrast, ARIA where needed
- **NFR-5**: Clean reusable component architecture following specified structure
- **NFR-6**: Optimized images, fast loading on mobile
- **NFR-7**: WhatsApp/phone/email clickable links, correct Algeria WhatsApp format for 0657387514
- **NFR-8**: Portfolio and pricing data structured in separate, easily-editable data files (not hard-coded into components)
- **NFR-9**: Homepage structure order: Header → Hero → Services → Featured Projects → Before/After → Why Us → Process → Pricing Preview → CTA → Testimonials → Contact → Footer

## Constraints
- **Technical**: Next.js + TypeScript + Tailwind CSS + shadcn/ui + Lucide icons only; avoid unnecessary dependencies
- **Business**: No invented facts (no fake certs, awards, years, project counts, reviews, employees, exact addresses, pricing not provided)
- **Dependencies**: No real backend; mock data with clear integration TODOs

## Assumptions
- Mock/demo content is acceptable for initial portfolio (placeholder images, placeholder project titles)
- Admin section is UI-only and must be marked as demo/insecure
- QR code will be placeholder area only
- No real uploaded branding images available; use text-based logo placeholder and professional stock-style construction imagery

## Acceptance Criteria

### AC-1: Multilingual System with RTL
- **Type**: `rule`
- **Given**: A user visiting the website
- **When**: The user selects Arabic, French, or English from the language switcher
- **Then**: All UI text updates to the selected language; when Arabic is selected, the entire interface (nav alignment, text alignment, buttons, icons, filters, forms) switches to RTL; French/English remain LTR; preference is stored in localStorage and persisted on reload
- **Pass Condition**: Language switcher in header/footer works; Arabic shows RTL; 3 languages fully translated; preference persists
- **Evidence**: Browser DevTools inspection of dir attribute, localStorage 'language' key, visual inspection of all sections in all 3 languages

### AC-2: Dark/Light Theme Toggle
- **Type**: `rule`
- **Given**: A user visiting the website
- **When**: The user clicks the theme toggle in header or footer
- **Then**: Site switches between light (white bg, black text, red accents, light gray sections) and dark (charcoal bg, white text, red accents, dark gray cards, images unfiltered); preference stored in localStorage
- **Pass Condition**: Toggle works; both themes render correctly; preference persists on reload via localStorage
- **Evidence**: Visual inspection of both modes, localStorage 'theme' key, html[data-theme] attribute

### AC-3: Sticky Responsive Header
- **Type**: `rule`
- **Given**: A user scrolling the page on any device
- **When**: Page loads and user scrolls
- **Then**: Header sticks to top; desktop shows full nav with logo + 6 links + language + theme toggle + Quote CTA; mobile shows hamburger menu with logo, theme toggle, language selector; header becomes slightly smaller after scrolling past top
- **Pass Condition**: Sticky behavior; responsive layouts at mobile/tablet/desktop breakpoints; shrink-on-scroll animation
- **Evidence**: Browser responsive mode testing, scroll behavior observation

### AC-4: Portfolio System with Categories and Project Detail
- **Type**: `rule`
- **Given**: A user viewing the portfolio
- **When**: User clicks category filters and project cards
- **Then**: Categories filter projects correctly (All, Drywall, Ceilings, Partitions, Painting, Decorative, Renovation, Commercial, Residential); clicking a project card opens a detail view (modal or page) with title, location, category, description, services, before/after, gallery, quote CTA; adding new categories/projects only requires editing data files (no component edits)
- **Pass Condition**: 9-category filtering works; project detail view displays all required fields; data is in separate files
- **Evidence**: Click-through of all filters, project detail open, inspection of data file structure under /data or /lib

### AC-5: Before/After Interactive Slider
- **Type**: `rule`
- **Given**: A before/after comparison section
- **When**: User drags or swipes the divider
- **Then**: Before and after images reveal smoothly; works on desktop (drag) and mobile (touch); visual animation
- **Pass Condition**: Slider moves smoothly; both images visible correctly; touch interaction works on mobile viewport
- **Evidence**: Interactive testing on both desktop and mobile viewport widths

### AC-6: Data-Driven Pricing Page
- **Type**: `rule`
- **Given**: A user viewing the Prices page
- **When**: Content is loaded
- **Then**: Categories displayed (Drywall, Ceilings, Partitions, Painting, Decorative, Finishing, Other); each item has service/description/unit/priceFrom/priceTo/notes/updatedAt; disclaimer text in 3 languages; CTA "Request a Custom Quote"; prices stored in structured data file separate from UI component
- **Pass Condition**: All 7 categories present; all item fields displayed; disclaimer shown; data file exists separate from UI
- **Evidence**: Page content inspection, data file existence and structure check

### AC-7: Quote Request Form with All Fields
- **Type**: `rule`
- **Given**: A user submitting a quote request
- **When**: User fills all required fields and submits
- **Then**: Form validates required fields (Name, Phone, Email, Location, ProjectType, Service, Description); accepts multiple photo uploads and document uploads; shows clear success message; form submission handler has clear TODO comments for Email/WhatsApp/Database/Supabase/CRM integration
- **Pass Condition**: All 12 fields present (10 specified + 2 uploads); validation works; success message displayed; integration comments present
- **Evidence**: Form submission flow testing, code inspection of submit handler with integration points

### AC-8: Contact Integrations (WhatsApp/Phone/Email)
- **Type**: `rule`
- **Given**: A user clicking contact buttons on any device
- **When**: User clicks WhatsApp button, Phone link, or Email link
- **Then**: WhatsApp opens wa.me link with Algeria country code (+213) + 657387514; Phone opens tel:0657387514 (clickable on mobile); Email opens mailto:redlinedeco@gmail.com; floating WhatsApp button is always visible on bottom-right of screen; mobile CTA bar shows WhatsApp/Call/Quote
- **Pass Condition**: WhatsApp link uses +213657387514 format; phone/email links are correct href types; floating button present; mobile CTA bar present on mobile viewport
- **Evidence**: Click testing all buttons, href attribute inspection

### AC-9: Homepage Section Order
- **Type**: `rule`
- **Given**: A user scrolling the homepage
- **When**: User scrolls from top to bottom
- **Then**: Sections appear in order: 1. Sticky Header 2. Hero 3. Services 4. Featured Projects 5. Before/After 6. Why Redline Deco 7. Work Process 8. Pricing Preview 9. CTA/Request Quote 10. Testimonials 11. Contact 12. Footer
- **Pass Condition**: Visual scroll confirms exact section order
- **Evidence**: DOM order inspection and scroll-through observation

### AC-10: Data Architecture for Future CMS Integration
- **Type**: `rule`
- **Given**: Developer examining codebase structure
- **When**: Looking at data models
- **Then**: TypeScript interfaces/types exist for Project {id,title,slug,category,location,year,description,services[],coverImage,images[],beforeImage,afterImage,featured,createdAt}, Category {id,name,slug,description}, Service {id,name,description,icon,startingPrice,unit}, Price {id,service,category,unit,priceFrom,priceTo,currency,notes,updatedAt}; data in separate files; components consume data via typed hooks/functions rather than inline; Supabase integration TODOs present
- **Pass Condition**: All 4 interface types present; data separated; clear data-fetching abstraction layer
- **Evidence**: TypeScript type definition inspection, file structure under /types and /data directories

### AC-11: Admin Section UI (/admin)
- **Type**: `rule`
- **Given**: A developer or user visiting /admin
- **When**: Route is accessed
- **Then**: Admin dashboard UI renders with areas for: Add/Edit/Delete Project, Add/Edit/Delete Category, Add/Edit/Delete Service, Edit Prices, Mark Featured, Upload Images; clear prominent disclaimer that this is demo UI and NOT production-secure authentication; navigation to /admin route works in Next.js app structure
- **Pass Condition**: /admin route exists; all listed management areas present in UI; disclaimer is visible and prominent
- **Evidence**: /admin page visit, disclaimer visibility check, UI component presence check

### AC-12: Professional Design Quality
- **Type**: `rubric`
- **Dimension**: Overall visual design quality, brand alignment, and professionalism
- **Scale**: 1-5
- **Anchors**: 1 = Unprofessional, generic template feel, poor red/white/black balance, looks like SaaS; 3 = Acceptable business website, uses brand colors, clean layout but lacks polish or has overused cards; 5 = Premium construction company feel, strong red/white/black visual identity, spacious modern minimal design, large high-quality imagery, professional typography, subtle animations, authentic construction aesthetic (not cartoon/SaaS/corporate)
- **Pass Threshold**: >= 4
- **Evidence**: Visual inspection across all pages, breakpoints, and themes

### AC-13: Responsive Mobile Experience
- **Type**: `rubric`
- **Dimension**: Mobile usability and visual quality
- **Scale**: 1-5
- **Anchors**: 1 = Broken layouts, horizontal scroll, tiny text, hard-to-tap buttons; 3 = Works on mobile but cramped, some elements awkward; 5 = Fast, excellent mobile layout, large readable text, easy WhatsApp/Call access, simple nav, optimized portfolio images, quote form easy, zero horizontal scroll, RTL perfect on mobile
- **Pass Threshold**: >= 4
- **Evidence**: Browser DevTools mobile viewport (320px-430px width) testing across all pages

### AC-14: Component Architecture Reusability
- **Type**: `rubric`
- **Dimension**: Component structure, reusability, and maintainability
- **Scale**: 1-5
- **Anchors**: 1 = Monolithic files, duplicated markup, no separation; 3 = Some components extracted but structure inconsistent; 5 = Clean /components folder with Header, Footer, LanguageSwitcher, ThemeToggle, Hero, Services, ServiceCard, Portfolio, PortfolioCard, PortfolioFilters, ProjectGallery, BeforeAfter, Pricing, QuoteForm, ContactSection, Testimonials, Process, WhatsAppButton, SectionTitle; data-driven components; minimal duplicated markup; pages under app directory routes
- **Pass Threshold**: >= 4
- **Evidence**: File tree inspection, component usage patterns review

### AC-15: SEO Structure
- **Type**: `rule`
- **Given**: Crawler or page source inspection
- **When**: Viewing source of homepage and key pages
- **Then**: Title is "Redline Deco | Painting & Drywalling | Sebdou - Tlemcen"; meta description matches provided text; H1/H2/H3 hierarchy correct; all images have alt text; OpenGraph meta tags present; favicon metadata configured
- **Pass Condition**: All specified SEO elements present in page source
- **Evidence**: "View Page Source" inspection of homepage

## Open Questions
- [ ] None at this time; all requirements fully specified in the source document
