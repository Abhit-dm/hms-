ALTER TABLE "Invoice" ADD COLUMN "admissionId" INTEGER REFERENCES "Admission"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Invoice" ADD COLUMN "invoiceType" TEXT NOT NULL DEFAULT 'GENERAL';
ALTER TABLE "Invoice" ADD COLUMN "invoiceDate" DATETIME;

CREATE TABLE "AdvancePayment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "patientId" INTEGER NOT NULL,
    "admissionId" INTEGER,
    "amount" REAL NOT NULL,
    "mode" TEXT NOT NULL,
    "reference" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AdvancePayment_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AdvancePayment_admissionId_fkey" FOREIGN KEY ("admissionId") REFERENCES "Admission" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "AdvancePayment_patientId_createdAt_idx" ON "AdvancePayment"("patientId", "createdAt");
CREATE INDEX "AdvancePayment_admissionId_createdAt_idx" ON "AdvancePayment"("admissionId", "createdAt");
