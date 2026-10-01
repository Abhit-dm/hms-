// Production-safe: creates/updates a single ADMIN user, unlike seed.js which is blocked in production.
import { PrismaClient, Role, UserStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const name = process.env.ADMIN_NAME || 'System Admin';
  const username = process.env.ADMIN_USERNAME || 'admin';
  const email = (process.env.ADMIN_EMAIL || 'admin@hms.local').toLowerCase();
  const password = process.env.ADMIN_PASSWORD || 'Admin@123';
  if (password.length < 8) throw new Error('ADMIN_PASSWORD must be at least 8 characters');

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.upsert({
    where: { email },
    update: { name, username, role: Role.ADMIN, status: UserStatus.ACTIVE, passwordHash },
    create: { name, username, email, passwordHash, role: Role.ADMIN, status: UserStatus.ACTIVE }
  });
  console.log(`Admin user ready -> email: ${user.email}, username: ${user.username}`);
}

main().catch((error) => { console.error(error); process.exit(1); }).finally(() => prisma.$disconnect());
