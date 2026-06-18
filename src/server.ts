import app from './app';
import { PrismaClient } from './generated/prisma/client';

const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

async function bootstrap() {
  try {
    // Test Database Pipeline connectivity before starting server
    await prisma.$connect();
    console.log('[DATABASE] Connected to MongoDB Atlas via Prisma Client successfully.');
    
    app.listen(PORT, () => {
      console.log(`[SERVER] Food-Delivery core backend engine actively running on port: ${PORT}`);
    });
  } catch (error) {
    console.error('[CRITICAL FAILURE] Database pipeline failed to initialize:', error);
    process.exit(1);
  }
}

bootstrap();