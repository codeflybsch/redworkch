# PRD – redwork.ch (Webdesign-Agentur Website + Admin & Faktura)

## Original Problem Statement (Turkish)

Kendi vps lerimde kuracagim sekilde, adim adim anlat bana 14 yasindayim ona göre anlat, debian, almalinux, ve ubuntu icin anlat. Web sitenin her tarafini, her sayfasini admin panelinde, düzeltip silip eklemek istiyorum. Mümkünse Swiss qr bill rechnung hazirlama sisteminide admin paneline entegre et müsterilere fatura cikarmak icin. Kontakt bölümünü ultra profesöynelce yap, Sikca sorulan sorular ve sikca kullanilan cevaplari da ekle (yaklasik 1000 soru cevap, 20 hazır cevap). Admin paneli responsive degil. PWA ekle. Ana sayfa responsive degil. PDF status 500 hatası. Vorschau acilmiyor. Çoklu sirket ekleme + logo. Katagori ve ürün ekleme. Tek tikla müsteriye gönderme. Offerte cikarma + gönderme.

## Architecture

- **Frontend**: React 19, React Router, TailwindCSS, Lucide icons
- **Backend**: FastAPI + Motor (async MongoDB), JWT auth
- **DB**: MongoDB
- **PDF**: ReportLab + qrbill (Swiss QR bill standard)
- **Email**: SMTP (configurable via env)
- **PWA**: manifest.json + sw.js

## What's been implemented (Iteration 1 – 2026-01)

### Backend
- ✅ JWT-based admin auth (login + me + token refresh)
- ✅ CRUD: projects, blogs, testimonials, services
- ✅ Site Settings (CMS) – Hero slides, badge, partners, stats, navigation,
  HowWeWork steps, Features, WhyUs reasons, **Contact section (phone, email,
  WhatsApp, address, map URL)**, **FAQ titles**, Footer
- ✅ FAQ CRUD (admin) + public listing + categories endpoint
- ✅ **987 FAQ entries** seeded (procedurally generated for ~20 branches × 20 cities/features × 6 timeframes + 60 hand-written)
- ✅ **20 Email reply templates** seeded (Eingangsbestätigung, Terminvorschlag, Angebot, Rechnung, etc.)
- ✅ **Companies / Mandanten**: multi-company with logo (base64), IBAN, VAT,
  invoice prefix, next number counters, default flag, set-default endpoint
- ✅ **Product Categories** + **Products** catalogue (6 cats, 20 products seeded)
- ✅ **Invoices** with auto-numbering `RW-RG-YYYY-XXXXX`, Swiss QR-bill PDF,
  HTML preview, mark-paid endpoint, send-via-email endpoint
- ✅ **Offers (Offerten)** with auto-numbering `RW-ANG-YYYY-XXXXX`, PDF,
  HTML preview, send endpoint
- ✅ Logo embedding in PDF + HTML preview
- ✅ Robust validation (returns 400 with German error message on missing data)
- ✅ Contact form + reply with SMTP attachment support
- ✅ Stats endpoint (counts of all entities)

### Frontend
- ✅ Public site sections: Header, Hero, Stats, HowWeWork, Projects, Blog,
  Services, Features, PromoVideo, Testimonials, WhyUs, **FAQSection (new,
  searchable, category pills, expandable)**, **ContactSection (new, professional,
  phone/email/WhatsApp/map cards)**, Footer
- ✅ Hero responsive (badge hidden on small screens, smaller titles)
- ✅ Admin panel: **mobile drawer sidebar (hamburger menu)**
- ✅ New admin pages:
  - FAQAdmin (search + category filter + edit modal)
  - Companies (cards + edit modal with logo upload, set-default)
  - Products (tabs: Products / Categories)
  - Invoices list + Offers list (shared component)
  - InvoiceEditor (shared for both invoice/offer, product picker from catalogue,
    summary panel with totals, save/preview/PDF/send buttons)
- ✅ EmailTemplates (existing, pre-routed)
- ✅ Token-authenticated PDF download / preview opens in new tab
- ✅ One-click "An Kunde senden" with PDF attachment
- ✅ PWA: manifest.json, sw.js (network-first + cache for static), apple-touch-icon

### Infra / Setup
- ✅ Updated `INSTALL.md` with full step-by-step Turkish guide for Debian, Ubuntu, AlmaLinux (designed for a 14-year-old)
- ✅ install-debian.sh and install-rhel.sh scripts (already in repo)

## What's NOT yet done

- 🟡 Email send only works once SMTP credentials are configured in `.env`
- 🟡 Native German PDF localisation (currently DE only, fr/it/en falls back to DE labels)
- 🟡 Visual page editor (drag-drop) for Hero – currently structured CMS only
- 🟡 SEO: per-page meta tags via CMS; XML sitemap auto-generation

## Test Status (Iteration 1 – 2026-01)

- Backend pytest: **25/25 passed (100%)**
- Frontend manual + automated: **All flows tested successfully**
- Admin login + sidebar nav + invoice flow + offer flow + product picker + FAQ search ✅
- PDF generation (invoices & offers): **valid %PDF bytes returned**
- HTML preview: **200 OK**
- Email send: **graceful failure** ("SMTP not configured") as expected

## Backlog / Next Action Items (P0 → P2)

**P0 – Should ship next**
- [ ] Configure SMTP in `.env` and test live email send to a real customer address
- [ ] Per-language PDF labels (FR/IT/EN) for international customers
- [ ] Add OpenGraph + Twitter card meta tags to public site for social sharing

**P1 – Quality of life**
- [ ] Drag-and-drop reordering of FAQs / projects in admin
- [ ] Bulk import/export of FAQs (CSV)
- [ ] Invoice templates (saved item lists for re-use)
- [ ] Recurring invoices (monthly maintenance)
- [ ] Customer/contact CRM (separate from contacts form)

**P2 – Nice to have**
- [ ] AI-assisted FAQ generation from project descriptions
- [ ] Public price calculator (uses product catalogue)
- [ ] Offerte → Invoice conversion (one-click)
- [ ] Time tracking + auto-invoice from logged hours

## User Personas

- **Owner / Admin (16+)** – manages everything from admin panel, no technical skills required
- **Customers** – browse public site, request quotes, receive invoices via email
- **Developer / Self-hoster** – deploys to own VPS using INSTALL.md
