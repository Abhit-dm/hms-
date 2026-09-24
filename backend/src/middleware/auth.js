import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function authenticate(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'Authentication required' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user || user.status !== 'ACTIVE') return res.status(401).json({ message: 'User account is inactive' });
    req.user = user;
    next();
  } catch { return res.status(401).json({ message: 'Invalid or expired token' }); }
}

export function authorize(...roles) {
  return (req, res, next) => roles.includes(req.user.role) ? next() : res.status(403).json({ message: 'You do not have permission to perform this action.' });
}
