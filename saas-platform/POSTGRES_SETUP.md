# PostgreSQL Setup für RedWORK SaaS

Ich empfehle für diese Plattform PostgreSQL.

## Lokal starten

```bash
cd saas-platform
docker compose up -d
cd backend
cp .env.example .env
npm install
npm run start:dev
```

## Warum nicht MongoDB?
MongoDB ist für flexible Content-Seiten okay. Für diese SaaS-Plattform sind aber Rechnungen, Zahlungen, Orders, Kunden, Hosting-Accounts, Server, Support und Domain-Auktionen miteinander verbunden. Dafür ist PostgreSQL stabiler und langfristig besser.

## Produktiv
- `synchronize=false` setzen
- TypeORM-Migrations verwenden
- PostgreSQL Backups täglich aktivieren
- Redis separat als Service laufen lassen
- Stripe Webhook URL: `https://deine-domain.ch/api/payment/webhook`
- WHM API Token nur in `.env` speichern
