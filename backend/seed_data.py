"""Seed data: FAQ entries, email reply templates, product catalogue.

The base FAQ list contains ~150 hand-written entries. To reach ~1000 we
programmatically expand them with cantonal/branch variations, ensuring
unique question/answer pairs.
"""

from typing import List

# ---------------------------------------------------------------------------
# Email reply templates (20 ready-made answers)
# ---------------------------------------------------------------------------
DEFAULT_EMAIL_TEMPLATES = [
    {"name": "Eingangsbestätigung", "category": "Allgemein", "subject": "Vielen Dank für Ihre Nachricht – wir melden uns kurzfristig", "body": "Hallo {{name}},\n\nherzlichen Dank für Ihre Anfrage bei redwork.ch. Wir haben Ihre Nachricht erhalten und melden uns innerhalb von 24 Stunden bei Ihnen mit einer ausführlichen Antwort.\n\nFreundliche Grüsse\nIhr redwork.ch-Team"},
    {"name": "Terminvorschlag", "category": "Beratung", "subject": "Terminvorschlag für unser Erstgespräch", "body": "Hallo {{name}},\n\nvielen Dank für Ihr Interesse. Gerne lade ich Sie zu einem unverbindlichen 30-minütigen Gespräch ein.\n\nMein Vorschlag:\n• ___ um ___ Uhr (Online via Google Meet)\n• ___ um ___ Uhr (Telefon)\n\nPasst Ihnen einer dieser Termine?\n\nFreundliche Grüsse"},
    {"name": "Angebot folgt", "category": "Angebot", "subject": "Ihr Angebot – wir arbeiten daran", "body": "Hallo {{name}},\n\nvielen Dank für die ausführlichen Informationen. Aktuell arbeiten wir an einem detaillierten Angebot für Ihr Projekt. Sie erhalten dieses spätestens bis ___ per E-Mail.\n\nFreundliche Grüsse"},
    {"name": "Angebot zugesendet", "category": "Angebot", "subject": "Ihr Angebot von redwork.ch", "body": "Hallo {{name}},\n\nim Anhang finden Sie wie besprochen unser Angebot mit detaillierter Leistungsbeschreibung, Festpreis-Kalkulation, Zeitplan und Zahlungsbedingungen.\n\nGerne bespreche ich mit Ihnen alle Details in einem kurzen Call.\n\nFreundliche Grüsse"},
    {"name": "Designvorschlag bereit", "category": "Projekt", "subject": "Ihr Designkonzept ist bereit zur Ansicht", "body": "Hallo {{name}},\n\ngute Nachrichten: Die ersten Designkonzepte für Ihr Projekt sind bereit.\n\nLink: ___\n\nIch freue mich auf Ihr Feedback bis spätestens ___.\n\nFreundliche Grüsse"},
    {"name": "Projekt-Update wöchentlich", "category": "Projekt", "subject": "Wochen-Update zu Ihrem Projekt", "body": "Hallo {{name}},\n\nhier ein kurzes Update aus dieser Woche:\n\n✅ Erledigt:\n- ___\n\n🔄 In Arbeit:\n- ___\n\n📅 Nächste Woche:\n- ___\n\nFreundliche Grüsse"},
    {"name": "Inhalte angefordert", "category": "Projekt", "subject": "Wir benötigen noch Inhalte von Ihnen", "body": "Hallo {{name}},\n\num das Projekt wie geplant abzuschliessen, benötigen wir bis ___ folgende Inhalte:\n\n• Texte für Seite ___\n• Logo in hoher Auflösung\n• Bilder/Fotos der Mitarbeitenden\n\nVielen Dank!\n\nFreundliche Grüsse"},
    {"name": "Go-Live Bestätigung", "category": "Projekt", "subject": "🎉 Ihre Website ist live!", "body": "Hallo {{name}},\n\nherzlichen Glückwunsch – Ihre neue Website ist seit heute online unter ___ erreichbar!\n\nDie nächsten 12 Monate Support sind inklusive.\n\nFreundliche Grüsse"},
    {"name": "Rechnung versendet", "category": "Rechnung", "subject": "Ihre Rechnung von redwork.ch", "body": "Hallo {{name}},\n\nim Anhang erhalten Sie wie vereinbart unsere Rechnung Nr. ___ über CHF ___.\n\nZahlbar bis ___ via QR-Code direkt im E-Banking.\n\nFreundliche Grüsse"},
    {"name": "Zahlungserinnerung freundlich", "category": "Rechnung", "subject": "Freundliche Zahlungserinnerung – Rechnung Nr. ___", "body": "Hallo {{name}},\n\nuns ist aufgefallen, dass die Rechnung Nr. ___ über CHF ___ noch offen ist. Falls bereits beglichen, betrachten Sie diese Mail bitte als gegenstandslos.\n\nFreundliche Grüsse"},
    {"name": "Mahnung 1. Stufe", "category": "Rechnung", "subject": "Mahnung – Rechnung Nr. ___ (CHF 20 Mahngebühr)", "body": "Hallo {{name}},\n\nleider ist die Rechnung Nr. ___ über CHF ___ noch nicht beglichen. Wir senden Ihnen hiermit die erste Mahnung und erheben eine Mahngebühr von CHF 20.\n\nBitte überweisen Sie den Betrag von CHF ___ bis zum ___ auf unser Konto.\n\nFreundliche Grüsse"},
    {"name": "Mahnung 2. Stufe", "category": "Rechnung", "subject": "Zweite Mahnung – Rechnung Nr. ___ (CHF 60 Mahngebühr + Inkassowarnung)", "body": "Hallo {{name}},\n\nobwohl wir Ihnen bereits eine erste Mahnung gesendet haben, ist die Rechnung Nr. ___ über CHF ___ noch immer offen. Wir erheben eine zweite Mahngebühr von CHF 60 und warnen Sie, dass wir bei weiterer Nichtzahlung das Inkasso-Verfahren einleiten werden.\n\nBitte überweisen Sie den Gesamtbetrag von CHF ___ bis zum ___ auf unser Konto.\n\nFreundliche Grüsse"},
    {"name": "Wartungserinnerung", "category": "Wartung", "subject": "Geplante Wartung Ihrer Website", "body": "Hallo {{name}},\n\nim Rahmen unseres Wartungsvertrags planen wir am ___ zwischen ___ und ___ Uhr ein Wartungsfenster.\n\nKurze Unterbrechungen möglich, alle Daten werden vorher gesichert.\n\nFreundliche Grüsse"},
    {"name": "Anfrage abgelehnt – höflich", "category": "Allgemein", "subject": "Zu Ihrer Anfrage", "body": "Hallo {{name}},\n\nvielen Dank, dass Sie uns für Ihr Vorhaben in Betracht gezogen haben. Leider sind unsere Kapazitäten in den nächsten Monaten bereits ausgebucht.\n\nGerne empfehle ich Ihnen Partner-Agenturen.\n\nFreundliche Grüsse"},
    {"name": "Beratung statt Auftrag", "category": "Beratung", "subject": "Buchung einer kostenpflichtigen Beratung", "body": "Hallo {{name}},\n\nfür Ihre Anfrage ist eine 60-minütige Strategie-Beratung möglicherweise zielführender als ein direkter Projektauftrag.\n\nKosten: CHF 240 (wird bei späterem Auftrag verrechnet).\n\nFreundliche Grüsse"},
    {"name": "Bewertung anfragen", "category": "Allgemein", "subject": "Wie war es, mit uns zusammenzuarbeiten?", "body": "Hallo {{name}},\n\nIhr Projekt ist nun seit einigen Wochen live. Falls Sie zufrieden waren, würden wir uns sehr über eine kurze Google-Bewertung freuen:\n\n👉 ___\n\nVielen Dank!\n\nFreundliche Grüsse"},
    {"name": "Empfehlung erbitten", "category": "Allgemein", "subject": "Kennen Sie jemanden, dem wir helfen können?", "body": "Hallo {{name}},\n\nfalls Sie in Ihrem Netzwerk jemanden kennen, der eine neue Website benötigt – wir freuen uns über jede Empfehlung. Bonus: 250 CHF auf den ersten Auftrag.\n\nFreundliche Grüsse"},
    {"name": "Schulungstermin", "category": "Projekt", "subject": "Ihre Backend-Schulung – Terminvorschlag", "body": "Hallo {{name}},\n\nim Rahmen Ihres Projekts ist eine 60-minütige Backend-Schulung inklusive.\n\nZwei Vorschläge:\n• ___\n• ___\n\nFreundliche Grüsse"},
    {"name": "Spam/SMTP-Hinweis", "category": "Technik", "subject": "Bitte prüfen Sie Ihren Spam-Ordner", "body": "Hallo {{name}},\n\nfalls Sie unsere E-Mails nicht erhalten haben, prüfen Sie bitte Ihren Spam-/Junk-Ordner.\n\nFügen Sie info@redwork.ch in Ihre Whitelist ein.\n\nFreundliche Grüsse"},
    {"name": "Abwesenheitsnotiz", "category": "Allgemein", "subject": "Aktuell ausser Haus – Antwort ab ___", "body": "Hallo {{name}},\n\nvielen Dank für Ihre Nachricht. Ich bin bis ___ ausser Haus.\n\nIn dringenden Fällen wenden Sie sich bitte an ___@redwork.ch.\n\nFreundliche Grüsse"},
    {"name": "Jahreswechsel-Gruss", "category": "Allgemein", "subject": "Frohes neues Jahr und vielen Dank!", "body": "Hallo {{name}},\n\nbevor das Jahr endet, möchten wir uns für die vertrauensvolle Zusammenarbeit bedanken.\n\nWir wünschen erholsame Festtage und einen erfolgreichen Start ins neue Jahr!\n\nHerzliche Grüsse\nIhr redwork.ch-Team"},
    {"name": "Projekt-Pause", "category": "Projekt", "subject": "Bestätigung der vorübergehenden Projekt-Pause", "body": "Hallo {{name}},\n\nwie besprochen pausieren wir Ihr Projekt vom ___ bis ___. In dieser Zeit fallen keine Stunden an.\n\nFreundliche Grüsse"},
]


# ---------------------------------------------------------------------------
# Response Templates for Contacts & Tickets
# ---------------------------------------------------------------------------
DEFAULT_RESPONSE_TEMPLATES = [
    {"name": "Eingangsbestätigung Kontakt", "category": "Kontakt", "body": "Hallo {{name}},\n\nvielen Dank für Ihre Kontaktanfrage. Wir haben Ihre Nachricht erhalten und werden uns innerhalb von 24 Stunden bei Ihnen melden.\n\nFreundliche Grüsse\nIhr redwork.ch-Team"},
    {"name": "Angebot-Anfrage", "category": "Kontakt", "body": "Hallo {{name}},\n\nvielen Dank für Ihr Interesse. Basierend auf Ihrer Beschreibung erstellen wir ein individuelles Angebot. Sie erhalten dieses in den nächsten 2-3 Arbeitstagen.\n\nFreundliche Grüsse"},
    {"name": "Projekt-Start", "category": "Kontakt", "body": "Hallo {{name}},\n\nwir freuen uns, dass Sie sich für uns entschieden haben! Als nächstes senden wir Ihnen den Vertrag und die Rechnung. Nach Zahlungseingang starten wir sofort mit Ihrem Projekt.\n\nFreundliche Grüsse"},
    {"name": "Ticket Eingangsbestätigung", "category": "Ticket", "subject": "Ihr Support-Ticket wurde erstellt", "body": "Hallo {{name}},\n\nIhr Support-Ticket wurde erfolgreich erstellt. Wir bearbeiten es innerhalb von 24 Stunden.\n\nTicket-ID: {{ticket_id}}\n\nFreundliche Grüsse"},
    {"name": "Ticket in Bearbeitung", "category": "Ticket", "subject": "Update zu Ihrem Support-Ticket", "body": "Hallo {{name}},\n\nIhr Ticket ist nun in Bearbeitung. Wir halten Sie auf dem Laufenden.\n\nFreundliche Grüsse"},
    {"name": "Ticket gelöst", "category": "Ticket", "subject": "Ihr Support-Ticket wurde gelöst", "body": "Hallo {{name}},\n\nIhr Support-Ticket wurde erfolgreich gelöst. Falls weitere Fragen auftauchen, können Sie jederzeit ein neues Ticket erstellen.\n\nFreundliche Grüsse"},
    {"name": "Hosting-Problem", "category": "Ticket", "subject": "Update zu Ihrem Hosting-Problem", "body": "Hallo {{name}},\n\nwir haben das Problem identifiziert und arbeiten an der Lösung. Ihr Hosting sollte in Kürze wieder normal funktionieren.\n\nFreundliche Grüsse"},
    {"name": "Domain-Problem", "category": "Ticket", "subject": "Update zu Ihrer Domain-Anfrage", "body": "Hallo {{name}},\n\nwir haben Ihre Domain-Anfrage bearbeitet. Die Änderungen sollten innerhalb von 24-48 Stunden wirksam werden.\n\nFreundliche Grüsse"},
]


# ---------------------------------------------------------------------------
# Hand-written FAQ base (reduced for brevity, expanded programmatically below)
# ---------------------------------------------------------------------------
_BASE_FAQS: List[dict] = [
    # ---------- Webdesign ----------
    {"category": "Webdesign", "question": "Was kostet eine professionelle Website in der Schweiz?", "answer": "Eine kleine Visitenkarten-Website beginnt bei 1'500–3'500 CHF, ein Unternehmensauftritt mit CMS bewegt sich zwischen 4'000 und 12'000 CHF, individuelle Web-Anwendungen oder grosse E-Commerce-Lösungen liegen oft zwischen 15'000 und 60'000 CHF. Wir erstellen nach einem kostenlosen Erstgespräch ein detailliertes Angebot."},
    {"category": "Webdesign", "question": "Wie lange dauert die Erstellung einer Website?", "answer": "Eine Landing-Page benötigt 1–2 Wochen, eine klassische Unternehmenswebsite 4–6 Wochen, komplexe Plattformen 8–16 Wochen."},
    {"category": "Webdesign", "question": "Bekomme ich vor dem Auftrag einen Designvorschlag?", "answer": "Ja, nach dem Briefing erstellen wir 1–2 visuelle Konzepte. Sie wählen die Richtung, wir verfeinern in 2 Revisionsrunden."},
    {"category": "Webdesign", "question": "Welches CMS empfehlt ihr?", "answer": "Für Standard-Websites WordPress, für individuelle Anforderungen Headless-CMS (Strapi, Sanity), für Hochleistungs-Projekte React/Next.js mit eigenem Backend."},
    {"category": "Webdesign", "question": "Ist meine Website mobiltauglich?", "answer": "Selbstverständlich. Jedes Projekt wird Mobile-First entwickelt und auf 30+ Geräten getestet."},
    {"category": "Webdesign", "question": "Werden Texte und Bilder von euch erstellt?", "answer": "Auf Wunsch ja: Textproduktion (DE/FR/IT/EN), Stockfoto-Auswahl und professionelle Fotoshootings."},
    {"category": "Webdesign", "question": "Wie viele Designanpassungen sind im Preis inbegriffen?", "answer": "Standard: 2 Revisionsrunden für das Konzept, 1 für die finale Umsetzung. Weitere Anpassungen nach Stundensatz (CHF 120/h)."},
    {"category": "Webdesign", "question": "Kann ich meine Website nachher selbst bearbeiten?", "answer": "Ja. Wir liefern jede Website mit benutzerfreundlichem Admin-Bereich und führen eine kostenlose Schulung durch."},
    {"category": "Webdesign", "question": "Gehört mir die Website am Ende komplett?", "answer": "Ja. Sie erhalten den Quellcode, Domain-Inhaberschaft und Admin-Zugänge. Keine Vendor-Lock-ins."},
    {"category": "Webdesign", "question": "Macht ihr auch Redesigns bestehender Webseiten?", "answer": "Sehr gerne. Wir analysieren die aktuelle Seite, übernehmen wertvolle Inhalte und SEO-Rankings."},
    {"category": "Webdesign", "question": "Welche Sprachen unterstützt eine Mehrsprachen-Website?", "answer": "Standardmässig DE/FR/IT/EN. Auf Wunsch jede weitere Sprache mit sauberer URL-Struktur und hreflang."},
    {"category": "Webdesign", "question": "Wie wird die Barrierefreiheit (WCAG) berücksichtigt?", "answer": "Wir entwickeln nach WCAG 2.1 Level AA: Farbkontrast, Tastaturnavigation, ARIA-Labels, Screenreader-Tests."},
    {"category": "Webdesign", "question": "Was unterscheidet redwork.ch von anderen Agenturen?", "answer": "Schweizer Qualität ohne Schweizer Aufschlag, 12 Monate kostenloser Support, transparente Festpreise, eigenes Entwicklerteam."},

    # ---------- E-Commerce ----------
    {"category": "E-Commerce", "question": "Welche Shop-Systeme empfehlt ihr?", "answer": "Für 50–500 Produkte: WooCommerce oder Shopify. Für >1'000 Produkte oder B2B: Magento, Shopware oder massgeschneiderte Systeme."},
    {"category": "E-Commerce", "question": "Welche Zahlungsmethoden integriert ihr?", "answer": "Twint, Visa/Mastercard, PayPal, Apple Pay, Google Pay, SEPA, Postfinance, Klarna, QR-Rechnungen, optional Krypto."},
    {"category": "E-Commerce", "question": "Wie wird die MwSt korrekt berechnet?", "answer": "Wir konfigurieren MwSt-Sätze (8.1% Standard, 2.6% reduziert, 3.8% Beherbergung) je nach Produktart."},
    {"category": "E-Commerce", "question": "Können Bestellungen automatisch ans ERP übertragen werden?", "answer": "Ja. Wir integrieren Schnittstellen zu Bexio, Abacus, SAP, Microsoft Dynamics oder Sage."},
    {"category": "E-Commerce", "question": "Wie funktioniert der Versand mit der Schweizer Post?", "answer": "Direkte Anbindung (PostPac, Briefe), automatische Etikettenerstellung, Tracking, Sameday-Optionen."},
    {"category": "E-Commerce", "question": "Was kostet ein Online-Shop?", "answer": "Einsteiger: 5'000–8'000 CHF. Mittlerer Shop mit ERP-Anbindung: 10'000–25'000 CHF. Enterprise/B2B: ab 30'000 CHF."},
    {"category": "E-Commerce", "question": "Können Kunden ein Konto erstellen und Wunschlisten speichern?", "answer": "Ja, inkl. Bestellverlauf, Wiederbestellung, Adressbuch und gespeicherten Zahlungsmethoden."},
    {"category": "E-Commerce", "question": "Habt ihr Erfahrung mit Galaxus/Digitec?", "answer": "Ja. Multi-Channel-Anbindungen via Channable oder direkter API-Integration."},
    {"category": "E-Commerce", "question": "Wie werden Rabatt-Codes verwaltet?", "answer": "Coupon-Codes (prozentual/fix), zeitlich begrenzte Aktionen, Mengenrabatte und Kundengruppen-Rabatte."},
    {"category": "E-Commerce", "question": "Wird die DSG/DSGVO im Shop umgesetzt?", "answer": "Ja. Cookie-Banner, Datenschutzerklärung, Auftragsdatenverarbeitungsvertrag, Recht auf Löschung."},

    # ---------- SEO ----------
    {"category": "SEO", "question": "Wie lange dauert es, bis SEO-Massnahmen greifen?", "answer": "Erste Verbesserungen 4–8 Wochen, signifikante Rankings 3–6 Monate."},
    {"category": "SEO", "question": "Was ist On-Page-SEO?", "answer": "Title-Tags, Meta-Descriptions, Headings, interne Verlinkung, semantisches HTML, Schema.org, Bildoptimierung, Ladezeit, qualitativer Content."},
    {"category": "SEO", "question": "Was ist Off-Page-SEO?", "answer": "Backlinks von vertrauenswürdigen Quellen, Erwähnungen, soziale Signale, Branchenverzeichnisse. Quality > Quantity."},
    {"category": "SEO", "question": "Optimiert ihr für lokale Suchen?", "answer": "Ja. Google-Business-Profil, lokale Keywords, NAP-Konsistenz, Citations (local.ch, search.ch), Bewertungen, Geo-Schema."},
    {"category": "SEO", "question": "Welche SEO-Tools verwendet ihr?", "answer": "Ahrefs, Sistrix, Screaming Frog, Search Console & Analytics, PageSpeed, Lighthouse, Semrush."},
    {"category": "SEO", "question": "Wie wird der Erfolg gemessen?", "answer": "Organischer Traffic, Keyword-Rankings, CTR, Conversions, Backlink-Wachstum, Sichtbarkeitsindex – monatlicher Report."},
    {"category": "SEO", "question": "Kostet SEO einmalig oder monatlich?", "answer": "Audits ab 800 CHF einmalig. Laufende Betreuung: 800–3'500 CHF/Monat."},
    {"category": "SEO", "question": "Was sind Core Web Vitals?", "answer": "LCP, INP und CLS sind Performance-Metriken von Google. Schnelle, stabile Seiten ranken besser."},

    # ---------- Hosting & Domain ----------
    {"category": "Hosting & Domain", "question": "Bietet ihr Hosting an?", "answer": "Ja. Schweizer Premium-Hosting in zertifizierten Rechenzentren (Zürich/Genf), SSD, tägliche Backups, SSL inkl. Pakete ab 19 CHF/Monat."},
    {"category": "Hosting & Domain", "question": "Wo werden meine Daten gespeichert?", "answer": "In ISO-27001-zertifizierten Schweizer Rechenzentren. Auf Wunsch EU-Hosting oder Multi-Region."},
    {"category": "Hosting & Domain", "question": "Shared Hosting vs. VPS – Unterschied?", "answer": "Shared: günstig, geteilte Ressourcen. VPS: dedizierte Ressourcen, schneller, ab 35 CHF/Monat empfehlenswert für Business."},
    {"category": "Hosting & Domain", "question": "Wie oft werden Backups gemacht?", "answer": "Standard: täglich, 30 Tage. Premium: stündlich, 90 Tage. Geografisch getrennte Speicherung."},
    {"category": "Hosting & Domain", "question": "Kann meine Domain umgezogen werden?", "answer": "Ja, kostenlos und unterbrechungsfrei. Wir koordinieren den Auth-Code mit Ihrem Registrar."},
    {"category": "Hosting & Domain", "question": "Was kostet eine Domain?", "answer": ".ch ca. 12 CHF/Jahr, .com ca. 15 CHF/Jahr, .swiss/.shop 30–80 CHF/Jahr."},

    # ---------- Mobile ----------
    {"category": "Mobile", "question": "Sind eure Webseiten mobiloptimiert?", "answer": "Ja, jede Website wird Mobile-First entwickelt und auf realen Geräten getestet."},
    {"category": "Mobile", "question": "Web-App vs. native App?", "answer": "Native: für iOS/Android, alle Gerätefunktionen, App Store. Web-App: Browser, günstiger, sofort updatebar. PWA als Mittelweg."},
    {"category": "Mobile", "question": "Was kostet eine native App?", "answer": "Single-Plattform ab 8'000 CHF, plattformübergreifend 18'000–40'000 CHF, komplexe Apps mit Backend ab 50'000 CHF."},
    {"category": "Mobile", "question": "Was ist eine Progressive Web App (PWA)?", "answer": "Eine Website, die wie eine App funktioniert: installierbar, offline-fähig, Push-Notifications. Keine App-Store-Genehmigung nötig."},

    # ---------- Software ----------
    {"category": "Software", "question": "Welche Programmiersprachen verwendet ihr?", "answer": "Frontend: React, Next.js, Vue, TypeScript. Backend: Node.js, Python, PHP, .NET. DB: PostgreSQL, MongoDB, MySQL, Redis."},
    {"category": "Software", "question": "Erstellt ihr interne Tools?", "answer": "Ja. Custom-CRM, Buchhaltungs-Tools, Reporting-Dashboards, Mitarbeiter-Portale, Lager-Management."},
    {"category": "Software", "question": "Bekomme ich den Quellcode?", "answer": "Ja. Vollständiger Source-Code, Dokumentation, Repository-Zugang, CI/CD-Setup."},
    {"category": "Software", "question": "Welche APIs könnt ihr integrieren?", "answer": "Stripe, Twint, PostFinance, Bexio, Abacus, Salesforce, HubSpot, Mailchimp, OpenAI, Anthropic, Twilio u.v.m."},
    {"category": "Software", "question": "Habt ihr KI-Erfahrung?", "answer": "Ja. GPT-Integration, Claude, Gemini, RAG-Systeme, Bilderkennung, Chatbots, Sprachausgabe."},

    # ---------- Branding ----------
    {"category": "Branding", "question": "Erstellt ihr Logos?", "answer": "Ja. 3 Konzepte zur Auswahl, 3 Revisionsrunden, alle Dateiformate (Vektor, Pixel, schwarz-weiss)."},
    {"category": "Branding", "question": "Was kostet ein Logo-Design?", "answer": "Starter: 600–1'000 CHF. Standard inkl. Variationen: 1'200–2'500 CHF. Komplettes CI: 3'500–8'000 CHF."},
    {"category": "Branding", "question": "Was beinhaltet ein CI-Paket?", "answer": "Logo + Variationen, Farbpalette, Typografie, Visitenkarten, Briefpapier, E-Mail-Signatur, Social-Templates, Brand-Guidelines."},
    {"category": "Branding", "question": "Welche Dateiformate für das Logo?", "answer": "AI, EPS, SVG (Vektor); PNG (transparent), JPG; PDF-Brand-Sheet; Favicon-Set."},

    # ---------- Ads ----------
    {"category": "Ads", "question": "Übernehmt ihr Google Ads?", "answer": "Ja. Keyword-Recherche, Anzeigentexte, Landing-Page-Optimierung, A/B-Tests, Conversion-Tracking, monatliches Reporting."},
    {"category": "Ads", "question": "Was kostet das Werbemanagement?", "answer": "Setup 800–1'500 CHF, Betreuung 600–2'500 CHF/Monat zzgl. Werbebudget. Mindestbudget 1'000 CHF/Monat empfohlen."},
    {"category": "Ads", "question": "Welche Plattformen empfehlt ihr?", "answer": "Google Search für aktive Suchende, Meta Ads für visuelle Branchen, LinkedIn für B2B, TikTok für junge Zielgruppen."},
    {"category": "Ads", "question": "Wie viel Budget ist sinnvoll?", "answer": "5–15% des Umsatzziels. Wir starten meist mit 1'000–3'000 CHF/Monat und skalieren basierend auf ROI."},

    # ---------- Sicherheit ----------
    {"category": "Sicherheit", "question": "Wie sicher sind eure Webseiten?", "answer": "OWASP-Top-10-Schutz, WAF, Brute-Force-Schutz, automatische Patches, regelmässige Pentests, SIEM-Monitoring."},
    {"category": "Sicherheit", "question": "Erstellt ihr SSL-Zertifikate?", "answer": "Ja, jedes Hosting beinhaltet kostenloses Let's-Encrypt mit Auto-Renewal. EV/OV-Zertifikate auf Wunsch."},
    {"category": "Sicherheit", "question": "Sind eure Webseiten DSG/DSGVO-konform?", "answer": "Ja. Cookie-Consent, Datenschutzerklärung, Auftragsdatenverarbeitungsverträge, Auskunfts-/Löschrechte."},

    # ---------- Support ----------
    {"category": "Support", "question": "Was ist im 12-Monate-Support enthalten?", "answer": "Sicherheits-Updates, kleine Inhaltsänderungen (1h/Monat), Fehlerbehebungen, Backup-Monitoring, E-Mail-Support."},
    {"category": "Support", "question": "Wie schnell wird auf Support reagiert?", "answer": "Bürozeiten: kritische Fehler <2h, Standard <8h. 24/7-Premium auf Anfrage."},
    {"category": "Support", "question": "Was kostet die Wartung nach dem ersten Jahr?", "answer": "Basic ab 49 CHF/Monat. Standard 149 CHF/Monat. Premium 349 CHF/Monat."},

    # ---------- Preise ----------
    {"category": "Preise", "question": "Festpreis oder Aufwand?", "answer": "Beides: klar definierte Projekte zum Festpreis, agile Projekte nach Aufwand (CHF 120/h)."},
    {"category": "Preise", "question": "Wie sind die Zahlungsbedingungen?", "answer": "40% bei Auftrag, 30% bei Designfreigabe, 30% nach Go-Live. Alternativ monatliche Raten."},
    {"category": "Preise", "question": "Akzeptiert ihr QR-Rechnungen?", "answer": "Selbstverständlich. Wir stellen ausschliesslich konforme Schweizer QR-Rechnungen aus."},
    {"category": "Preise", "question": "Welche Zahlungsmethoden akzeptiert ihr?", "answer": "Banküberweisung, Twint, Kreditkarte, PayPal, optional Stripe-Link, Apple/Google Pay, Krypto."},

    # ---------- Rechnung ----------
    {"category": "Rechnung", "question": "Wie sieht eure Rechnung aus?", "answer": "Schweizer QR-Rechnung mit detaillierter Leistungsaufstellung, MwSt-Ausweisung, Fälligkeitsdatum, QR-Code."},
    {"category": "Rechnung", "question": "Wie lange habe ich Zeit, eine Rechnung zu bezahlen?", "answer": "Standard 30 Tage netto. Skonto 2% bei Zahlung innert 10 Tagen vereinbar."},
    {"category": "Rechnung", "question": "Kann ich eine Rechnung in EUR erhalten?", "answer": "Ja. Standard CHF, alternativ EUR/USD zum tagesaktuellen SECO-Kurs +1.5%."},
]


# ---------------------------------------------------------------------------
# Procedural expansion to ~1000 FAQ entries
# ---------------------------------------------------------------------------
_CITIES = [
    "Zürich", "Bern", "Basel", "Genf", "Lausanne", "Luzern", "St. Gallen",
    "Winterthur", "Lugano", "Biel", "Thun", "Schaffhausen", "Fribourg", "Sion",
    "Chur", "Zug", "Aarau", "Solothurn", "Neuchâtel", "Baden",
]
_BRANCHES = [
    ("Restaurant & Gastronomie", "Restaurants und Cafés"),
    ("Arztpraxis", "Ärztinnen und Ärzte"),
    ("Anwaltskanzlei", "Anwältinnen und Anwälte"),
    ("Treuhand & Buchhaltung", "Treuhandbüros"),
    ("Immobilienmakler", "Immobilienmaklerinnen"),
    ("Coiffeur & Beauty", "Coiffeur-Salons"),
    ("Fitnessstudio", "Fitnessstudios"),
    ("Architekturbüro", "Architekturbüros"),
    ("Garage & Autohandel", "Garagisten"),
    ("Online-Shop / E-Commerce", "Online-Shops"),
    ("Handwerk & Bauunternehmen", "Handwerksbetriebe"),
    ("Hotel & Ferienwohnung", "Hotels"),
    ("Verein & Stiftung", "Vereine"),
    ("Beratungsunternehmen", "Beratungsfirmen"),
    ("Bildung & Schulen", "Schulen und Akademien"),
    ("Tierarztpraxis", "Tierarztpraxen"),
    ("Yoga- und Wellness-Studio", "Wellness-Studios"),
    ("Werbeagentur & Druckerei", "Werbeagenturen"),
    ("IT-Dienstleister", "IT-Dienstleister"),
    ("Energie & Solar", "Solar-Firmen"),
]
_FEATURES = [
    ("Online-Terminbuchung", "Mit einem Buchungssystem reduzieren wir Telefonate, schicken automatische Erinnerungen und synchronisieren Termine mit Ihrem Kalender."),
    ("DSGVO-konformes Kontaktformular", "Sichere Formulare mit Spam-Schutz, doppeltem Opt-In und automatischer Bestätigung."),
    ("Mehrsprachigkeit (DE/FR/IT/EN)", "Saubere URL-Struktur, hreflang-Tags, automatische Übersetzungs-Workflows mit Lektorat."),
    ("Twint-Zahlungsintegration", "Direkte Twint-Anbindung in Shop und Buchungssystem. Auch QR-Code-Zahlungen."),
    ("Newsletter-Anbindung", "Mailchimp, Brevo oder Klaviyo werden mit Ihren Lead-Quellen verbunden – DSG-konform."),
    ("Live-Chat / WhatsApp", "WhatsApp-Business-Bubble oder Live-Chat-Widget für sofortige Antworten."),
    ("Google-Maps-Integration", "Eingebettete Karten mit Routenplanung und mehreren Standorten."),
    ("Bewertungen & Referenzen", "Echtzeit-Anbindung an Google-Bewertungen, Trustpilot oder eigene Referenzdatenbank."),
    ("Online-Shop mit QR-Rechnung", "Vollständiger Bezahlprozess mit Schweizer QR-Rechnung, Twint, Kreditkarte und Rechnungskauf."),
    ("Mitglieder-/Kundenbereich", "Geschützter Login mit individuellem Dashboard, Dokumenten und Bestellverlauf."),
    ("Blog & Content-Marketing", "SEO-optimierte Blog-Engine, Redaktionsplan, Themenrecherche und Vermarktung."),
    ("Marketing-Automation", "E-Mail-Strecken, Lead-Scoring und automatische Folge-Aktionen."),
    ("Social-Media-Anbindung", "Automatische Veröffentlichung aus dem CMS auf LinkedIn, Instagram, Facebook und X."),
    ("Cookie-Banner & Consent", "DSG- und EU-konformes Consent-Management mit detaillierten Einstellmöglichkeiten."),
    ("Such-Funktion mit Filtern", "Schnelle Volltextsuche mit Facetten und Auto-Complete."),
    ("Mobile App / PWA", "Optional als installierbare PWA oder native App."),
    ("Performance-Optimierung", "Bilder werden automatisch in WebP/AVIF konvertiert, lazy-loading, CDN, Code-Splitting."),
    ("Barrierefreiheit (WCAG 2.1)", "Tastaturnavigation, ARIA-Labels, Kontraste, Screenreader-Tests."),
    ("KI-Chatbot", "FAQ-Bot, der auf Ihre Inhalte trainiert ist – DSG-konform, on-premise möglich."),
    ("Custom Reporting Dashboard", "Live-Statistiken, KPI-Übersicht, automatische Reports per E-Mail."),
]
_TIME_FRAMES = [
    "kurzfristig innerhalb 2 Wochen",
    "im Verlauf von 4 Wochen",
    "in 4–6 Wochen",
    "in 6–8 Wochen",
    "innerhalb 8–12 Wochen",
    "über mehrere Monate verteilt",
]


def _gen_branch_city_questions() -> List[dict]:
    """Generate ~400 entries: every branch × every city = 20 × 20 = 400."""
    out = []
    for branch_name, branch_plural in _BRANCHES:
        for city in _CITIES:
            out.append({
                "category": branch_name,
                "question": f"Was kostet eine professionelle Website für {branch_name} in {city}?",
                "answer": (
                    f"Für {branch_plural} in {city} starten unsere Festpreise bei rund 1'800 CHF "
                    f"(reine Online-Visitenkarte) und bewegen sich für komplette Kundenseiten mit CMS, "
                    f"Buchungs- oder Shop-Funktionen typischerweise zwischen 4'500 und 12'000 CHF. "
                    "Nach einem 30-minütigen kostenlosen Erstgespräch erhalten Sie ein detailliertes "
                    "Festpreis-Angebot, eine transparente Leistungsbeschreibung und einen Zeitplan."
                ),
            })
    return out


def _gen_feature_questions() -> List[dict]:
    """Generate ~400 entries: feature × branch = 20 × 20 = 400."""
    out = []
    for feature_name, feature_desc in _FEATURES:
        for branch_name, branch_plural in _BRANCHES:
            out.append({
                "category": feature_name,
                "question": f"Können Sie {feature_name} für ein {branch_name} integrieren?",
                "answer": (
                    f"Ja, {feature_name} ist eine bei {branch_plural} besonders gefragte Funktion. {feature_desc} "
                    "Wir analysieren zuerst Ihre Prozesse, dokumentieren die Anforderungen und integrieren die "
                    "Funktion entweder direkt in die bestehende Website oder als eigenständiges Modul. "
                    "Schulung Ihres Teams und 12 Monate Support sind im Preis enthalten."
                ),
            })
    return out


def _gen_timing_questions() -> List[dict]:
    """Generate ~120 entries: branch × time = 20 × 6 = 120."""
    out = []
    for branch_name, branch_plural in _BRANCHES:
        for tf in _TIME_FRAMES:
            out.append({
                "category": "Zeitplan",
                "question": f"Können Sie eine Website für ein {branch_name} {tf} umsetzen?",
                "answer": (
                    f"Ja. Die Umsetzung {tf} ist für die meisten {branch_plural} realistisch, sofern Inhalte "
                    "(Texte, Bilder, Logo) zeitnah verfügbar sind. Wir arbeiten in 2-Wochen-Sprints mit "
                    "wöchentlichen Updates und liefern jeden Sprint einen funktionierenden Zwischenstand."
                ),
            })
    return out


def _build_all_faqs() -> List[dict]:
    base = list(_BASE_FAQS)
    base.extend(_gen_branch_city_questions())
    base.extend(_gen_feature_questions())
    base.extend(_gen_timing_questions())
    # Add order
    for i, item in enumerate(base):
        item.setdefault("order", i)
    return base


DEFAULT_FAQS = _build_all_faqs()


# ---------------------------------------------------------------------------
# Product catalogue (categories + sample products)
# ---------------------------------------------------------------------------
DEFAULT_PRODUCT_CATEGORIES = [
    {"name": "Webdesign", "description": "Webseiten und Landing-Pages", "order": 1},
    {"name": "Software", "description": "Individuelle Software & Apps", "order": 2},
    {"name": "SEO & Marketing", "description": "SEO, Ads, Content", "order": 3},
    {"name": "Hosting & Wartung", "description": "Hosting, Domain, laufende Wartung", "order": 4},
    {"name": "Branding & Design", "description": "Logo, CI, Druck", "order": 5},
    {"name": "Beratung", "description": "Strategie & Beratungsleistungen", "order": 6},
    {"name": "Hosting", "description": "Webhosting, VPS, Dedicated Server", "order": 7},
    {"name": "Domains", "description": "Domain-Registrierung", "order": 8},
    {"name": "SSL-Zertifikate", "description": "SSL-Sicherheit", "order": 9},
]


DEFAULT_PRODUCTS = [
    {"name": "Landing-Page (1 Seite)", "description": "Eine Premium-Landing-Page inkl. Design, CMS-Block und SEO-Grundlage", "unitPrice": 1800.0, "unit": "Stk.", "order": 1},
    {"name": "Unternehmens-Website (5 Seiten)", "description": "Mehrseitige Website mit CMS, Kontaktformular und SEO", "unitPrice": 4500.0, "unit": "Stk.", "order": 2},
    {"name": "E-Commerce Starter (bis 100 Produkte)", "description": "Online-Shop mit QR-Rechnung, Twint, Versandanbindung", "unitPrice": 6800.0, "unit": "Stk.", "order": 3},
    {"name": "Logo-Design Standard", "description": "3 Konzepte, 3 Revisionsrunden, alle Dateiformate", "unitPrice": 1200.0, "unit": "Stk.", "order": 4},
    {"name": "Corporate Identity Paket", "description": "Logo + Visitenkarten, Briefpapier, Signatur, Templates, Brand-Guidelines", "unitPrice": 3500.0, "unit": "Stk.", "order": 5},
    {"name": "SEO-Audit", "description": "Technisches & inhaltliches Audit mit Massnahmenplan", "unitPrice": 800.0, "unit": "Stk.", "order": 6},
    {"name": "SEO-Betreuung Standard", "description": "Laufende On-Page-Optimierung, Reporting, 1 Blogartikel/Monat", "unitPrice": 1200.0, "unit": "Monat", "order": 7},
    {"name": "Google Ads Setup", "description": "Kampagnenstruktur, Anzeigentexte, Conversion-Tracking", "unitPrice": 950.0, "unit": "Stk.", "order": 8},
    {"name": "Google Ads Betreuung", "description": "Monatliche Optimierung, Reporting, A/B-Tests", "unitPrice": 800.0, "unit": "Monat", "order": 9},
    {"name": "Hosting Premium", "description": "Schweizer Premium-Hosting mit täglichen Backups, SSL, Monitoring", "unitPrice": 35.0, "unit": "Monat", "order": 10},
    {"name": "Domain (.ch)", "description": "Schweizer Domain inkl. Verwaltung", "unitPrice": 19.0, "unit": "Jahr", "order": 11},
    {"name": "Wartungspaket Basic", "description": "Sicherheits-Updates, Monitoring, 30 Min Änderungen pro Monat", "unitPrice": 49.0, "unit": "Monat", "order": 12},
    {"name": "Wartungspaket Standard", "description": "Wie Basic + 2h Änderungen pro Monat", "unitPrice": 149.0, "unit": "Monat", "order": 13},
    {"name": "Wartungspaket Premium", "description": "5h Änderungen, Priorisierung, 24/7-Notfall", "unitPrice": 349.0, "unit": "Monat", "order": 14},
    {"name": "Beratungsstunde", "description": "Strategie-, Tech- oder UX-Beratung nach Aufwand", "unitPrice": 120.0, "unit": "Stunde", "order": 15},
    {"name": "Schulung Backend (1h)", "description": "Online- oder Vor-Ort-Schulung", "unitPrice": 120.0, "unit": "Stunde", "order": 16},
    {"name": "Texterstellung pro Seite", "description": "SEO-optimierte Texte für eine Webseite", "unitPrice": 180.0, "unit": "Seite", "order": 17},
    {"name": "Foto-Shooting halber Tag", "description": "Professionelle Fotos vor Ort, 4 Stunden", "unitPrice": 950.0, "unit": "Tag", "order": 18},
    {"name": "Fotoshooting ganzer Tag", "description": "Professionelle Fotos vor Ort, 8 Stunden inkl. Bildbearbeitung", "unitPrice": 1750.0, "unit": "Tag", "order": 19},
    {"name": "Mehrsprachigkeit Aufpreis", "description": "Pro zusätzliche Sprache (DE→FR/IT/EN), inkl. Übersetzung", "unitPrice": 650.0, "unit": "Sprache", "order": 20},
    # Hosting products
    {"categoryId": "hosting", "name": "Webhosting Basic", "description": "1 Website, 10 GB Speicher, unbegrenzter Traffic, SSL, E-Mail", "unitPrice": 9.90, "unit": "Monat", "order": 21},
    {"categoryId": "hosting", "name": "Webhosting Professional", "description": "5 Websites, 50 GB Speicher, unbegrenzter Traffic, SSL, E-Mail, Backup", "unitPrice": 19.90, "unit": "Monat", "order": 22},
    {"categoryId": "hosting", "name": "Webhosting Enterprise", "description": "Unbegrenzte Websites, 200 GB Speicher, unbegrenzter Traffic, SSL, E-Mail, täglich Backup, CDN", "unitPrice": 49.90, "unit": "Monat", "order": 23},
    {"categoryId": "hosting", "name": "VPS Basic", "description": "1 vCPU, 2 GB RAM, 20 GB SSD, unbegrenzter Traffic", "unitPrice": 29.90, "unit": "Monat", "order": 24},
    {"categoryId": "hosting", "name": "VPS Professional", "description": "2 vCPU, 4 GB RAM, 40 GB SSD, unbegrenzter Traffic", "unitPrice": 49.90, "unit": "Monat", "order": 25},
    {"categoryId": "hosting", "name": "VPS Enterprise", "description": "4 vCPU, 8 GB RAM, 80 GB SSD, unbegrenzter Traffic", "unitPrice": 99.90, "unit": "Monat", "order": 26},
    {"categoryId": "hosting", "name": "Dedicated Server Basic", "description": "Intel i3, 8 GB RAM, 500 GB HDD, 100 Mbit/s", "unitPrice": 149.90, "unit": "Monat", "order": 27},
    {"categoryId": "hosting", "name": "Dedicated Server Professional", "description": "Intel i5, 16 GB RAM, 1 TB SSD, 1 Gbit/s", "unitPrice": 249.90, "unit": "Monat", "order": 28},
    {"categoryId": "hosting", "name": "Dedicated Server Enterprise", "description": "Intel i7, 32 GB RAM, 2 TB SSD, 1 Gbit/s, Managed", "unitPrice": 399.90, "unit": "Monat", "order": 29},
    {"categoryId": "domains", "name": ".ch Domain", "description": "Schweizer Domain-Registrierung", "unitPrice": 15.00, "unit": "Jahr", "order": 30},
    {"categoryId": "domains", "name": ".com Domain", "description": "Internationale Domain-Registrierung", "unitPrice": 12.00, "unit": "Jahr", "order": 31},
    {"categoryId": "domains", "name": ".de Domain", "description": "Deutsche Domain-Registrierung", "unitPrice": 8.00, "unit": "Jahr", "order": 32},
    {"categoryId": "ssl", "name": "SSL Basic (DV)", "description": "Domain Validation SSL-Zertifikat", "unitPrice": 25.00, "unit": "Jahr", "order": 33},
    {"categoryId": "ssl", "name": "SSL Professional (OV)", "description": "Organization Validation SSL-Zertifikat", "unitPrice": 75.00, "unit": "Jahr", "order": 34},
    {"categoryId": "ssl", "name": "SSL Enterprise (EV)", "description": "Extended Validation SSL-Zertifikat", "unitPrice": 150.00, "unit": "Jahr", "order": 35},
]

# Empty defaults for other collections
DEFAULT_PROJECTS = []
DEFAULT_BLOGS = []
DEFAULT_TESTIMONIALS = []
DEFAULT_SERVICES = []
DEFAULT_COMPANIES = []

# ---------------------------------------------------------------------------
# Test Users for Development
# ---------------------------------------------------------------------------
DEFAULT_TEST_USERS = [
    {
        "_id": "test-user-001",
        "email": "kunde@test.ch",
        "passwordHash": "$2b$12$znweUVivpdw/cG05XW3Wv.la.pn7/P6CH5lK3x8k25unEJKMME2sG",
        "firstName": "Max",
        "lastName": "Mustermann",
        "company": "Test GmbH",
        "phone": "+41 79 123 45 67",
        "emailVerified": True,
        "role": "customer",
        "deleted": False,
        "createdAt": "2024-01-01T00:00:00Z",
        "lastLogin": None
    },
    {
        "_id": "test-user-002",
        "email": "anna@test.ch",
        "passwordHash": "$2b$12$znweUVivpdw/cG05XW3Wv.la.pn7/P6CH5lK3x8k25unEJKMME2sG",
        "firstName": "Anna",
        "lastName": "Schmidt",
        "company": "Anna's Boutique",
        "phone": "+41 79 987 65 43",
        "emailVerified": True,
        "role": "customer",
        "deleted": False,
        "createdAt": "2024-01-15T00:00:00Z",
        "lastLogin": None
    },
    {
        "_id": "test-user-003",
        "email": "peter@test.ch",
        "passwordHash": "$2b$12$znweUVivpdw/cG05XW3Wv.la.pn7/P6CH5lK3x8k25unEJKMME2sG",
        "firstName": "Peter",
        "lastName": "Weber",
        "company": "Weber Consulting",
        "phone": "+41 44 555 12 34",
        "emailVerified": True,
        "role": "customer",
        "deleted": False,
        "createdAt": "2024-02-01T00:00:00Z",
        "lastLogin": None
    }
]
