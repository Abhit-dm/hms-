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

https://abhitcare.cloud/api

## FRONTEND URL

http://localhost:5173

## MAIN HMS WORKFLOW

Login → role dashboard → patient registration/search → appointment queue → laboratory orders/results → pharmacy stock and sales → OP/IP billing, inpatient advance payments, and bill summaries. The API persists patients, invoices, invoice payments, inpatient advances, appointments, products, batches, pharmacy sales, lab orders/results, users, and audit events in SQLite. Completing an OP registration prints the registration slip and bill on A4 paper.

## DATABASE COMMANDS

```powershell
npm run db:generate
npm run db:migrate
npm run db:seed
npm run db:studio
```

## PRODUCTION DEPLOYMENT NOTES

SQLite is retained for local development and single-instance evaluation. For production, use PostgreSQL or MySQL, managed backups, TLS termination, secret management, monitoring, key rotation, and a formal migration/rehearsal process. The API now enforces security headers, CORS allowlisting, login throttling, input bounds, audit writes, and database-level appointment slot uniqueness.

### DEPLOYING TO HOSTINGER (SQLITE) — FIXING "DATABASE CONNECTION FAILED" AT LOGIN

There are two common causes; check both.

**A. Frontend still points at `localhost` (most common on Hostinger).** Production builds use `https://abhitcare.cloud/api` regardless of `VITE_API_URL`. If the deployed site still calls `localhost`, it is serving an older frontend bundle. Rebuild (`npm --prefix frontend run build`) and re-upload the `frontend/dist` output. Also set `CORS_ORIGIN` in `backend/.env` to the frontend URL so the API accepts the request.

**B. Backend can't reach the SQLite file.** `.env` and `*.db` are in `.gitignore` on purpose (secrets/binary data should not be committed), which means a plain git/zip deploy will NOT upload `backend/.env` or `database/dev.db`. Missing `.env` (no `DATABASE_URL`/`JWT_SECRET`) or a missing/empty database file is the next most common cause. To fix it on the server:

1. Create `backend/.env` on the server (it will not exist after a git-based deploy):
   ```
   PORT=5000
   DATABASE_URL="file:../database/dev.db"
   JWT_SECRET="<a-random-32+-character-secret>"
   CORS_ORIGIN="https://your-domain.com"
   NODE_ENV=production
   TRUST_PROXY=true
   ```
2. Make sure the `database/` folder exists next to `backend/` and is writable by the Node process (`mkdir -p database` at the repo root, then `chmod 775 database`).
3. Install dependencies and generate the Prisma client **on the server** (do not upload `node_modules` from Windows — the Prisma engine binary is platform-specific):
   ```
   npm --prefix backend install
   npm run db:generate
   ```
4. Apply migrations to create the SQLite schema/tables:
   ```
   npm run db:migrate:deploy
   ```
5. Create the admin login (safe to run in production, unlike `db:seed` which is blocked when `NODE_ENV=production`):
   ```
   npm run db:create-admin
   ```
   Optionally override defaults: `ADMIN_EMAIL`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `ADMIN_NAME` environment variables.
6. Start the API (`npm --prefix backend run start`) and confirm `GET /api/ready` returns `{"status":"ready","database":"ok"}`.

#### Default admin login (created by `npm run db:create-admin`)

- Username or email: `admin` or `admin@hms.local`
- Password: `Admin@123`

Change this password immediately after first login, or set `ADMIN_PASSWORD` before running the command to choose your own.

Run `npm --prefix backend audit --omit=dev` before deployment. At this revision npm reports three high-severity advisories in Prisma's `deepmerge-ts` dependency chain, with no non-breaking fix available; upgrade Prisma across its major-version boundary only after a dedicated compatibility and migration review.

## KNOWN DEVELOPMENT LIMITATIONS

The initial local release focuses on the working authenticated vertical slice. Consultation authoring, prescriptions, reporting filters, and some full CRUD screens remain to be expanded. OP/IP billing, room-related inpatient charges, advance payments, invoice-date adjustment, and printable A4 bills are available to Admin and Reception. Pharmacy login and billing are available through the authenticated `/api/pharmacy/sales` workflow; the current pharmacy frontend view is still primarily stock-oriented and needs a dedicated cashier screen. Password reset, refresh tokens, production deployment hardening, encryption, backups, compliance controls, and real medical-data validation are not included.
