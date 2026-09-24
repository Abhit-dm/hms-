# CareDesk HMS

A local Hospital Management System built with React/Vite, Express, Prisma, and SQLite. This is a development system for demonstration only and must not be used with real patient data without professional security, compliance, backup, and infrastructure work.

## HOW TO RUN THE HMS

Requirements: Node.js 20+ and npm.

```powershell
npm install
npm --prefix backend install
npm --prefix frontend install
Copy-Item backend/.env.example backend/.env
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

Open the frontend at http://localhost:5173. The API is at http://localhost:5000 and Prisma Studio can be opened with `npm run db:studio`.

## DEMO LOGIN CREDENTIALS

- ADMIN: admin@hms.local / Admin@123
- DOCTOR: doctor@hms.local / Doctor@123
- RECEPTION: reception@hms.local / Reception@123
- LAB: lab@hms.local / Lab@123
- PHARMACY: pharmacy@hms.local / Pharmacy@123

These credentials are development/demo credentials only. `npm run db:seed` is blocked when `NODE_ENV=production`; production administrators must be provisioned through a controlled process and all credentials must be rotated.

## DATABASE LOCATION

SQLite database: `database/dev.db`. Its path is configured through `backend/.env` using `DATABASE_URL="file:../database/dev.db"`.

## API URL

http://localhost:5000/api

## FRONTEND URL

http://localhost:5173

## MAIN HMS WORKFLOW

Login → role dashboard → patient registration/search → appointment queue → laboratory orders/results → pharmacy stock and sales → billing and payment records. The implemented API persists patients, appointments, products, batches, pharmacy sales, lab orders/results, users, and audit events in SQLite.

## DATABASE COMMANDS

```powershell
npm run db:generate
npm run db:migrate
npm run db:seed
npm run db:studio
```

## PRODUCTION DEPLOYMENT NOTES

SQLite is retained for local development and single-instance evaluation. For production, use PostgreSQL or MySQL, managed backups, TLS termination, secret management, monitoring, key rotation, and a formal migration/rehearsal process. The API now enforces security headers, CORS allowlisting, login throttling, input bounds, audit writes, and database-level appointment slot uniqueness.

Run `npm --prefix backend audit --omit=dev` before deployment. At this revision npm reports three high-severity advisories in Prisma's `deepmerge-ts` dependency chain, with no non-breaking fix available; upgrade Prisma across its major-version boundary only after a dedicated compatibility and migration review.

## KNOWN DEVELOPMENT LIMITATIONS

The initial local release focuses on the working authenticated vertical slice. Consultation authoring, prescriptions, general invoice/payment screens, inpatient admission/discharge UI, file uploads, printable templates, reporting filters, and full CRUD screens remain to be expanded. Pharmacy login and billing are available through the authenticated `/api/pharmacy/sales` workflow; the current pharmacy frontend view is still primarily stock-oriented and needs a dedicated cashier screen. The backend schema already includes the core entities for the remaining modules. Password reset, refresh tokens, production deployment hardening, encryption, backups, compliance controls, and real medical-data validation are not included.
