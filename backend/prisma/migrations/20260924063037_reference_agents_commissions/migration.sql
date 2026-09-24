-- CreateTable
CREATE TABLE "ReferenceAgent" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "occupation" TEXT,
    "commissionPercent" REAL NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Invoice" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "invoiceNumber" TEXT NOT NULL,
    "patientId" INTEGER NOT NULL,
    "subtotal" REAL NOT NULL,
    "discount" REAL NOT NULL DEFAULT 0,
    "tax" REAL NOT NULL DEFAULT 0,
    "total" REAL NOT NULL,
    "paid" REAL NOT NULL DEFAULT 0,
    "referenceAgentId" INTEGER,
    "commissionPercent" REAL NOT NULL DEFAULT 0,
    "commissionAmount" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Invoice_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Invoice_referenceAgentId_fkey" FOREIGN KEY ("referenceAgentId") REFERENCES "ReferenceAgent" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Invoice" ("createdAt", "discount", "id", "invoiceNumber", "paid", "patientId", "status", "subtotal", "tax", "total") SELECT "createdAt", "discount", "id", "invoiceNumber", "paid", "patientId", "status", "subtotal", "tax", "total" FROM "Invoice";
DROP TABLE "Invoice";
ALTER TABLE "new_Invoice" RENAME TO "Invoice";
CREATE UNIQUE INDEX "Invoice_invoiceNumber_key" ON "Invoice"("invoiceNumber");
CREATE TABLE "new_Patient" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "patientNumber" TEXT NOT NULL,
    "registrationType" TEXT NOT NULL DEFAULT 'OUTPATIENT',
    "firstName" TEXT NOT NULL,
    "lastName" TEXT,
    "mobile" TEXT NOT NULL,
    "email" TEXT,
    "gender" TEXT NOT NULL,
    "title" TEXT,
    "dateOfBirth" DATETIME,
    "age" INTEGER,
    "bloodGroup" TEXT,
    "maritalStatus" TEXT,
    "aadhaarNumber" TEXT,
    "occupation" TEXT,
    "countryCode" TEXT DEFAULT '+91',
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "locality" TEXT,
    "pinCode" TEXT,
    "guardianName" TEXT,
    "guardianRelationship" TEXT,
    "guardianMobile" TEXT,
    "symptoms" TEXT,
    "allergies" TEXT,
    "medicalConditions" TEXT,
    "emergencyContactName" TEXT,
    "emergencyContactNumber" TEXT,
    "photoPath" TEXT,
    "departmentId" INTEGER,
    "referenceAgentId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Patient_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Patient_referenceAgentId_fkey" FOREIGN KEY ("referenceAgentId") REFERENCES "ReferenceAgent" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Patient" ("aadhaarNumber", "address", "age", "allergies", "bloodGroup", "city", "countryCode", "createdAt", "dateOfBirth", "departmentId", "email", "emergencyContactName", "emergencyContactNumber", "firstName", "gender", "guardianMobile", "guardianName", "guardianRelationship", "id", "lastName", "locality", "maritalStatus", "medicalConditions", "mobile", "occupation", "patientNumber", "photoPath", "pinCode", "registrationType", "state", "symptoms", "title", "updatedAt") SELECT "aadhaarNumber", "address", "age", "allergies", "bloodGroup", "city", "countryCode", "createdAt", "dateOfBirth", "departmentId", "email", "emergencyContactName", "emergencyContactNumber", "firstName", "gender", "guardianMobile", "guardianName", "guardianRelationship", "id", "lastName", "locality", "maritalStatus", "medicalConditions", "mobile", "occupation", "patientNumber", "photoPath", "pinCode", "registrationType", "state", "symptoms", "title", "updatedAt" FROM "Patient";
DROP TABLE "Patient";
ALTER TABLE "new_Patient" RENAME TO "Patient";
CREATE UNIQUE INDEX "Patient_patientNumber_key" ON "Patient"("patientNumber");
CREATE INDEX "Patient_mobile_idx" ON "Patient"("mobile");
CREATE INDEX "Patient_firstName_lastName_idx" ON "Patient"("firstName", "lastName");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "ReferenceAgent_name_idx" ON "ReferenceAgent"("name");

-- CreateIndex
CREATE INDEX "ReferenceAgent_phone_idx" ON "ReferenceAgent"("phone");
