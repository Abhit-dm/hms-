-- CreateTable
CREATE TABLE "AdmissionRoomStay" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "admissionId" INTEGER NOT NULL,
    "roomId" INTEGER NOT NULL,
    "bedId" INTEGER NOT NULL,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" DATETIME,
    "dailyRate" REAL NOT NULL,
    CONSTRAINT "AdmissionRoomStay_admissionId_fkey" FOREIGN KEY ("admissionId") REFERENCES "Admission" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AdmissionRoomStay_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AdmissionRoomStay_bedId_fkey" FOREIGN KEY ("bedId") REFERENCES "Bed" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Admission" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "patientId" INTEGER NOT NULL,
    "bedId" INTEGER NOT NULL,
    "doctorId" INTEGER,
    "referredDays" INTEGER,
    "admissionDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dischargeDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'ADMITTED',
    "attendantName" TEXT,
    "attendantMobile" TEXT,
    "dischargeSummary" TEXT,
    "finalDiagnosis" TEXT,
    CONSTRAINT "Admission_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Admission_bedId_fkey" FOREIGN KEY ("bedId") REFERENCES "Bed" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Admission_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Admission" ("admissionDate", "attendantMobile", "attendantName", "bedId", "dischargeDate", "dischargeSummary", "finalDiagnosis", "id", "patientId", "status") SELECT "admissionDate", "attendantMobile", "attendantName", "bedId", "dischargeDate", "dischargeSummary", "finalDiagnosis", "id", "patientId", "status" FROM "Admission";
DROP TABLE "Admission";
ALTER TABLE "new_Admission" RENAME TO "Admission";
CREATE TABLE "new_Room" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "wardId" INTEGER NOT NULL,
    "number" TEXT NOT NULL,
    "roomType" TEXT NOT NULL,
    "dailyRate" REAL NOT NULL DEFAULT 0,
    CONSTRAINT "Room_wardId_fkey" FOREIGN KEY ("wardId") REFERENCES "Ward" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Room" ("id", "number", "roomType", "wardId") SELECT "id", "number", "roomType", "wardId" FROM "Room";
DROP TABLE "Room";
ALTER TABLE "new_Room" RENAME TO "Room";
CREATE UNIQUE INDEX "Room_wardId_number_key" ON "Room"("wardId", "number");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "AdmissionRoomStay_admissionId_startedAt_idx" ON "AdmissionRoomStay"("admissionId", "startedAt");
