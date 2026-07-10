import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { config } from './environment';
import { PrismaClient } from '../generated/prisma/client';

const pool = new Pool({ connectionString: config.DATABASE_URL });
const adapter = new PrismaPg(pool);
const globalForPrisma = global as unknown as { prisma: PrismaClient };

const prisma = new PrismaClient({
  adapter,
  log: ['error', 'warn'],
});
if (config.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
