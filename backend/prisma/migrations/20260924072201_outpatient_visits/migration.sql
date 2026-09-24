-- CreateTable
CREATE TABLE "OutpatientVisit" (
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OutpatientVisit_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "OutpatientVisit_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
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
    "abhaNumber" TEXT,
    "isMlc" BOOLEAN NOT NULL DEFAULT false,
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
INSERT INTO "new_Patient" ("aadhaarNumber", "address", "age", "allergies", "bloodGroup", "city", "countryCode", "createdAt", "dateOfBirth", "departmentId", "email", "emergencyContactName", "emergencyContactNumber", "firstName", "gender", "guardianMobile", "guardianName", "guardianRelationship", "id", "lastName", "locality", "maritalStatus", "medicalConditions", "mobile", "occupation", "patientNumber", "photoPath", "pinCode", "referenceAgentId", "registrationType", "state", "symptoms", "title", "updatedAt") SELECT "aadhaarNumber", "address", "age", "allergies", "bloodGroup", "city", "countryCode", "createdAt", "dateOfBirth", "departmentId", "email", "emergencyContactName", "emergencyContactNumber", "firstName", "gender", "guardianMobile", "guardianName", "guardianRelationship", "id", "lastName", "locality", "maritalStatus", "medicalConditions", "mobile", "occupation", "patientNumber", "photoPath", "pinCode", "referenceAgentId", "registrationType", "state", "symptoms", "title", "updatedAt" FROM "Patient";
DROP TABLE "Patient";
ALTER TABLE "new_Patient" RENAME TO "Patient";
CREATE UNIQUE INDEX "Patient_patientNumber_key" ON "Patient"("patientNumber");
CREATE INDEX "Patient_mobile_idx" ON "Patient"("mobile");
CREATE INDEX "Patient_firstName_lastName_idx" ON "Patient"("firstName", "lastName");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "OutpatientVisit_patientId_appointmentDate_idx" ON "OutpatientVisit"("patientId", "appointmentDate");
