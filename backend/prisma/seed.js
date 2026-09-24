import { PrismaClient, Role, UserStatus, PaymentMode, RegistrationType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const demoUsers = [
  ['System Admin', 'admin', 'admin@hms.local', 'Admin@123', Role.ADMIN],
  ['Abhit Admin', 'abhit', 'abhit@hms.local', 'Abhit@123', Role.ADMIN],
  ['Dr. Maya Shah', 'doctor', 'doctor@hms.local', 'Doctor@123', Role.DOCTOR],
  ['Aarav Reception', 'reception', 'reception@hms.local', 'Reception@123', Role.RECEPTION],
  ['Nisha Lab', 'lab', 'lab@hms.local', 'Lab@123', Role.LAB],
  ['Pharmacy Desk', 'pharmacy', 'pharmacy@hms.local', 'Pharmacy@123', Role.PHARMACY]
];

async function main() {
  if (process.env.NODE_ENV === 'production') throw new Error('Demo seed is disabled in production. Create the first administrator through a controlled provisioning process.');
  const departments = {};
  for (const name of ['General Medicine', 'Cardiology', 'Laboratory']) {
    departments[name] = await prisma.department.upsert({ where: { name }, update: {}, create: { name } });
  }
  const users = {};
  for (const [name, username, email, password, role] of demoUsers) {
    users[role] = await prisma.user.upsert({
      where: { email },
      update: { name, username, role, status: UserStatus.ACTIVE },
      create: { name, username, email, passwordHash: await bcrypt.hash(password, 12), role }
    });
  }
  const doctor = await prisma.doctor.upsert({
    where: { userId: users.DOCTOR.id }, update: { active: true },
    create: { userId: users.DOCTOR.id, name: users.DOCTOR.name, qualification: 'MBBS, MD', specialization: 'Internal Medicine', departmentId: departments['General Medicine'].id, consultationFee: 600, email: users.DOCTOR.email }
  });
  const patient = await prisma.patient.upsert({
    where: { patientNumber: 'PAT-2026-000001' }, update: {},
    create: { patientNumber: 'PAT-2026-000001', registrationType: RegistrationType.OUTPATIENT, firstName: 'Riya', lastName: 'Mehta', mobile: '9000000001', gender: 'Female', age: 29, city: 'Pune', state: 'Maharashtra', bloodGroup: 'O+' }
  });
  await prisma.appointment.deleteMany({ where: { patientId: patient.id } });
  await prisma.appointment.create({ data: { patientId: patient.id, doctorId: doctor.id, departmentId: departments['General Medicine'].id, appointmentDate: new Date(), appointmentTime: '10:30', reason: 'Routine consultation' } });
  const products = [
    ['Paracetamol 500mg', 'Paracetamol', 'Analgesic', 120, 20, 5],
    ['Amoxicillin 500mg', 'Amoxicillin', 'Antibiotic', 40, 85, 10],
    ['Cetirizine 10mg', 'Cetirizine', 'Antiallergic', 18, 35, 8],
    ['Omeprazole 20mg', 'Omeprazole', 'Gastro', 75, 45, 10],
    ['ORS', 'Oral Rehydration Salts', 'Hydration', 60, 25, 15]
  ];
  for (const [name, genericName, category, quantity, sellingPrice, reorderLevel] of products) {
    const product = await prisma.pharmacyProduct.upsert({ where: { sku: name.slice(0, 3).toUpperCase() + '2026' }, update: {}, create: { name, genericName, category, sku: name.slice(0, 3).toUpperCase() + '2026', reorderLevel } });
    await prisma.pharmacyBatch.upsert({ where: { productId_batchNumber: { productId: product.id, batchNumber: 'DEMO-' + product.id } }, update: { quantity }, create: { productId: product.id, batchNumber: 'DEMO-' + product.id, expiryDate: new Date('2027-12-31'), quantity, purchasePrice: sellingPrice * 0.65, sellingPrice, taxPercentage: 5, supplier: 'Demo Supplier' } });
  }
  for (const [name, code, price, sampleType, normalRange] of [['Complete Blood Count', 'CBC', 350, 'Blood', 'As per lab reference'], ['Blood Sugar', 'BS', 120, 'Blood', '70-140 mg/dL'], ['Urine Routine', 'UR', 180, 'Urine', 'Negative']]) {
    await prisma.labTest.upsert({ where: { code }, update: {}, create: { name, code, price, sampleType, normalRange, departmentId: departments.Laboratory.id } });
  }
  console.log('Seeded DEMO DATA:', Object.values(users).map((user) => `${user.role}:${user.email}`).join(', '));
}

main().catch((error) => { console.error(error); process.exit(1); }).finally(() => prisma.$disconnect());
