# redwork.ch – Product Requirements

## Original problem statement (Jan/May 2026)
1. ZIP'ten projeyi çıkar ve çalıştır.
2. Admin panelindeki Kontakt bölümüne gelen maillere admin panelinden cevap verebilelim.
3. Hero (anasayfa) içindeki tüm öğeleri (slider başlıkları, alt yazı, butonlar,
   12-Aylık Support rozeti, partner barı, derecelendirme, istatistikler)
   admin panelden düzenleme/ekleme yapabilelim. Hero içindeki `_` çizgileri kaldırıldı.
4. VPS/VDS (Debian, Ubuntu, AlmaLinux) için adım-adım kurulum dosyası hazırla.

## Architecture
- Frontend: React 19 + TailwindCSS (CRA via craco)
- Backend: FastAPI + Motor (async MongoDB) on port 8001
- Auth: JWT bearer (admin only, env-based)
- Email: stdlib `smtplib` (SMTP_* env vars)

## Implemented (May 2026)

### Kontakt cevap akışı
- Backend endpoints: `GET /api/admin/email-config`, `GET /api/admin/contacts/{id}/replies`,
  `POST /api/admin/contacts/{id}/reply`, `DELETE /api/admin/contacts/{id}/replies/{rid}`.
- Real SMTP with TLS/SSL/plain auto-detect; replies persisted with `emailSent`/`emailError`.
- Status auto-update: `done` on success, `in_progress` otherwise.
- Frontend (`Contacts.jsx`): thread view + inline reply form, prefilled `Re:`,
  per-reply badges, SMTP-not-configured warning banner, all `data-testid`s.
- **Live SMTP doğrulandı** with `mail.redwork.ch:465` (Plesk).

### Hero / Site içerik yönetimi
- New backend `site_settings` collection + endpoints:
  - `GET  /api/site-settings` (public)
  - `PUT  /api/admin/site-settings` (admin)
- `Hero.jsx` ve `StatsBar.jsx` artık API'den okuyor (mock.js'i kullanmıyor).
- Hero içindeki `_` çizgileri kaldırıldı.
- `<y>...</y>` markeri ile inline gelb (sarı) highlight, `<b>...</b>` ile bold.
- New admin page `SiteSettings.jsx` with 5 tabs:
  - Hero & Slides (slide ekle/sil/sırala)
  - Support-Badge (ON/OFF + 6 metin alanı)
  - Buttons (Kontakt + Angebot için 4 metin)
  - Partner & Bewertung (partner listesi + sterne + rating text)
  - Statistiken (4 alan: number/suffix/label, sıralanabilir)

### Deployment
- `/app/install-debian.sh` – Debian 11/12, Ubuntu 22.04/24.04
- `/app/install-rhel.sh`   – AlmaLinux 9, Rocky 9, RHEL 9
- `/app/INSTALL.md` – 14 yaşındaki başlangıç seviyesi için Türkçe step-by-step rehber
  (DNS, SSH, dosya gönderme, script çalıştırma, sorun giderme, yedekleme).

## SMTP configuration (backend/.env)
```
SMTP_HOST=mail.redwork.ch
SMTP_PORT=465
SMTP_USER=info@redwork.ch
SMTP_PASSWORD=...
SMTP_FROM=info@redwork.ch
SMTP_FROM_NAME=RedWORK | WebDesign, App, Hosting
SMTP_USE_TLS=true
```

## Backlog / next ideas
- Rich-text/HTML editor for replies + attachment support.
- Reply templates / saved snippets.
- Sidebar badge for new contacts/quotes.
- IMAP polling: müşteri cevabını aynı thread'e geri çek.
- HowWeWork, Features, Reasons, Footer text'leri için de admin editor.
- Nginx + supervisor için tek systemd servisi (e2 deploy uyumu).
