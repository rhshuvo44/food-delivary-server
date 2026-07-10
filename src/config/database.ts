import prisma from './prisma';

export async function connectDatabase(): Promise<void> {
  try {
    await prisma.$connect();
    console.info('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
}
