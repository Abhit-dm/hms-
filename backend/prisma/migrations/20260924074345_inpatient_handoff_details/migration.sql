-- AlterTable
ALTER TABLE "Admission" ADD COLUMN "vitals" TEXT;

-- AlterTable
ALTER TABLE "Patient" ADD COLUMN "motherName" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_OutpatientVisit" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "patientId" INTEGER NOT NULL,
    "doctorId" INTEGER,
    "visitType" TEXT NOT NULL,
    "referralType" TEXT,
    "appointmentDate" DATETIME,
    "appointmentTime" TEXT,
    "consultationFee" REAL NOT NULL DEFAULT 0,
    "registrationFee" REAL NOT NULL DEFAULT 0,
    "paymentMode" TEXT NOT NULL DEFAULT 'CASH',
    "discount" REAL NOT NULL DEFAULT 0,
    "discountAmount" REAL NOT NULL DEFAULT 0,
    "finalAmount" REAL NOT NULL DEFAULT 0,
    "paidAmount" REAL NOT NULL DEFAULT 0,
    "balanceAmount" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OutpatientVisit_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "OutpatientVisit_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_OutpatientVisit" ("appointmentDate", "appointmentTime", "consultationFee", "createdAt", "discount", "discountAmount", "doctorId", "finalAmount", "id", "patientId", "paymentMode", "referralType", "registrationFee", "visitType") SELECT "appointmentDate", "appointmentTime", "consultationFee", "createdAt", "discount", "discountAmount", "doctorId", "finalAmount", "id", "patientId", "paymentMode", "referralType", "registrationFee", "visitType" FROM "OutpatientVisit";
DROP TABLE "OutpatientVisit";
ALTER TABLE "new_OutpatientVisit" RENAME TO "OutpatientVisit";
CREATE INDEX "OutpatientVisit_patientId_appointmentDate_idx" ON "OutpatientVisit"("patientId", "appointmentDate");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
