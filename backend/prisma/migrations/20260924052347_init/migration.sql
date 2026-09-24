-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Department" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Doctor" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "qualification" TEXT,
    "specialization" TEXT,
    "departmentId" INTEGER,
    "phone" TEXT,
    "email" TEXT,
    "consultationFee" REAL NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "Doctor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Doctor_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Patient" (
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Patient_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Appointment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "patientId" INTEGER NOT NULL,
    "doctorId" INTEGER NOT NULL,
    "departmentId" INTEGER,
    "appointmentDate" DATETIME NOT NULL,
    "appointmentTime" TEXT NOT NULL,
    "reason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Appointment_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Appointment_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Appointment_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Consultation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "patientId" INTEGER NOT NULL,
    "doctorId" INTEGER NOT NULL,
    "appointmentId" INTEGER,
    "chiefComplaint" TEXT,
    "symptoms" TEXT,
    "diagnosis" TEXT,
    "examinationNotes" TEXT,
    "treatmentPlan" TEXT,
    "followUpDate" DATETIME,
    "doctorNotes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Consultation_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Consultation_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Consultation_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Prescription" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "patientId" INTEGER NOT NULL,
    "doctorId" INTEGER NOT NULL,
    "consultationId" INTEGER,
    "diagnosis" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Prescription_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Prescription_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Prescription_consultationId_fkey" FOREIGN KEY ("consultationId") REFERENCES "Consultation" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PrescriptionItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "prescriptionId" INTEGER NOT NULL,
    "productId" INTEGER,
    "medicineName" TEXT NOT NULL,
    "dosage" TEXT,
    "frequency" TEXT,
    "duration" TEXT,
    "route" TEXT,
    "instructions" TEXT,
    CONSTRAINT "PrescriptionItem_prescriptionId_fkey" FOREIGN KEY ("prescriptionId") REFERENCES "Prescription" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PrescriptionItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "PharmacyProduct" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PharmacyProduct" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "genericName" TEXT,
    "category" TEXT,
    "manufacturer" TEXT,
    "sku" TEXT,
    "hsnSac" TEXT,
    "reorderLevel" INTEGER NOT NULL DEFAULT 10,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PharmacyBatch" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "productId" INTEGER NOT NULL,
    "batchNumber" TEXT NOT NULL,
    "expiryDate" DATETIME NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "purchasePrice" REAL NOT NULL,
    "sellingPrice" REAL NOT NULL,
    "taxPercentage" REAL NOT NULL DEFAULT 0,
    "supplier" TEXT,
    CONSTRAINT "PharmacyBatch_productId_fkey" FOREIGN KEY ("productId") REFERENCES "PharmacyProduct" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PharmacySale" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "patientId" INTEGER,
    "subtotal" REAL NOT NULL,
    "tax" REAL NOT NULL,
    "discount" REAL NOT NULL DEFAULT 0,
    "total" REAL NOT NULL,
    "paymentMode" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PharmacySale_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PharmacySaleItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "saleId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "batchId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" REAL NOT NULL,
    "tax" REAL NOT NULL,
    CONSTRAINT "PharmacySaleItem_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "PharmacySale" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PharmacySaleItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "PharmacyProduct" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PharmacySaleItem_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "PharmacyBatch" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LabTest" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "departmentId" INTEGER,
    "price" REAL NOT NULL,
    "sampleType" TEXT,
    "normalRange" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "LabTest_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LabOrder" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "patientId" INTEGER NOT NULL,
    "orderedById" INTEGER NOT NULL,
    "consultationId" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'ORDERED',
    "technicianNotes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "LabOrder_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "LabOrder_orderedById_fkey" FOREIGN KEY ("orderedById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "LabOrder_consultationId_fkey" FOREIGN KEY ("consultationId") REFERENCES "Consultation" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LabOrderItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "labOrderId" INTEGER NOT NULL,
    "labTestId" INTEGER NOT NULL,
    CONSTRAINT "LabOrderItem_labOrderId_fkey" FOREIGN KEY ("labOrderId") REFERENCES "LabOrder" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LabOrderItem_labTestId_fkey" FOREIGN KEY ("labTestId") REFERENCES "LabTest" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LabResult" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "orderItemId" INTEGER NOT NULL,
    "sampleDate" DATETIME,
    "result" TEXT NOT NULL,
    "unit" TEXT,
    "normalRange" TEXT,
    "remarks" TEXT,
    "completedAt" DATETIME,
    CONSTRAINT "LabResult_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "LabOrderItem" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "invoiceNumber" TEXT NOT NULL,
    "patientId" INTEGER NOT NULL,
    "subtotal" REAL NOT NULL,
    "discount" REAL NOT NULL DEFAULT 0,
    "tax" REAL NOT NULL DEFAULT 0,
    "total" REAL NOT NULL,
    "paid" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Invoice_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InvoiceItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "invoiceId" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" REAL NOT NULL,
    CONSTRAINT "InvoiceItem_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "invoiceId" INTEGER,
    "amount" REAL NOT NULL,
    "mode" TEXT NOT NULL,
    "reference" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Payment_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Ward" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Room" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "wardId" INTEGER NOT NULL,
    "number" TEXT NOT NULL,
    "roomType" TEXT NOT NULL,
    CONSTRAINT "Room_wardId_fkey" FOREIGN KEY ("wardId") REFERENCES "Ward" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Bed" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "roomId" INTEGER NOT NULL,
    "number" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    CONSTRAINT "Bed_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Admission" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "patientId" INTEGER NOT NULL,
    "bedId" INTEGER NOT NULL,
    "admissionDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dischargeDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'ADMITTED',
    "attendantName" TEXT,
    "attendantMobile" TEXT,
    "dischargeSummary" TEXT,
    "finalDiagnosis" TEXT,
    CONSTRAINT "Admission_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Admission_bedId_fkey" FOREIGN KEY ("bedId") REFERENCES "Bed" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Department_name_key" ON "Department"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Doctor_userId_key" ON "Doctor"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Patient_patientNumber_key" ON "Patient"("patientNumber");

-- CreateIndex
CREATE INDEX "Patient_mobile_idx" ON "Patient"("mobile");

-- CreateIndex
CREATE INDEX "Patient_firstName_lastName_idx" ON "Patient"("firstName", "lastName");

-- CreateIndex
CREATE INDEX "Appointment_appointmentDate_doctorId_idx" ON "Appointment"("appointmentDate", "doctorId");

-- CreateIndex
CREATE UNIQUE INDEX "Consultation_appointmentId_key" ON "Consultation"("appointmentId");

-- CreateIndex
CREATE UNIQUE INDEX "Prescription_consultationId_key" ON "Prescription"("consultationId");

-- CreateIndex
CREATE UNIQUE INDEX "PharmacyProduct_sku_key" ON "PharmacyProduct"("sku");

-- CreateIndex
CREATE INDEX "PharmacyProduct_name_idx" ON "PharmacyProduct"("name");

-- CreateIndex
CREATE UNIQUE INDEX "PharmacyBatch_productId_batchNumber_key" ON "PharmacyBatch"("productId", "batchNumber");

-- CreateIndex
CREATE UNIQUE INDEX "LabTest_code_key" ON "LabTest"("code");

-- CreateIndex
CREATE UNIQUE INDEX "LabResult_orderItemId_key" ON "LabResult"("orderItemId");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_invoiceNumber_key" ON "Invoice"("invoiceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Ward_name_key" ON "Ward"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Room_wardId_number_key" ON "Room"("wardId", "number");

-- CreateIndex
CREATE UNIQUE INDEX "Bed_roomId_number_key" ON "Bed"("roomId", "number");
