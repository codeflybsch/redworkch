# Datenbank-Entscheidung für RedWORK Hosting SaaS

## Entscheidung: PostgreSQL für die neue SaaS-Plattform

Für Hosting-Verkauf, Rechnungen, Zahlungen, Kunden, WHM/cPanel-Accounts, Support-Tickets und Domain-Auktionen ist PostgreSQL die bessere Wahl als MongoDB.

### Warum PostgreSQL?
- Zahlungs- und Rechnungssysteme brauchen saubere Relationen und Transaktionen.
- Orders, Invoices, Hosting Accounts, Kunden und Server sind stark miteinander verbunden.
- Für Admin-Tabellen, Filter, Reports und Buchhaltung ist SQL stabiler.
- Stripe-Webhooks und WHM-Provisionierung lassen sich sicherer mit Status-Feldern und Transaktionen steuern.
- PostgreSQL passt besser zu einer WHMCS-ähnlichen SaaS-Plattform.

### MongoDB bleibt nur für das bestehende alte System
Das bestehende FastAPI/MongoDB-System kann weiterlaufen, aber die neue professionelle Hosting-SaaS sollte unter `saas-platform` mit NestJS + PostgreSQL + Redis aufgebaut werden.

### Ziel-Stack
- Frontend: Next.js App Router + TypeScript
- Backend: NestJS
- Datenbank: PostgreSQL
- Queue: Redis + Bull
- Payments: Stripe + TWINT manuell/halbautomatisch
- Hosting: WHM/cPanel API
