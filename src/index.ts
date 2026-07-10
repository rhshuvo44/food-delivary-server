import dotenv from 'dotenv';
import { connectDatabase, disconnectDatabase } from './config/database';
import { config } from './config/environment';
import { app } from './presentation/app';
import { logger } from './utils/logger';
dotenv.config();
const PORT = config.PORT;

async function startServer(): Promise<void> {
  try {
    await connectDatabase();

    const server = app.listen(PORT, () => {
      logger.info(`✅ Server running on http://localhost:${PORT}`);
      logger.info(`📝 Environment: ${config.NODE_ENV}`);
    });

    const gracefulShutdown = (): void => {
      logger.info('\n⏹️  Shutting down gracefully...');
      server.close((closeError) => {
        if (closeError) {
          logger.error('❌ Failed to close server:', closeError);
          process.exit(1);
          return;
        }

        void disconnectDatabase()
          .then(() => {
            logger.info('✅ Database disconnected');
            process.exit(0);
          })
          .catch((error: unknown) => {
            logger.error('❌ Failed to disconnect database:', error);
            process.exit(1);
          });
      });
    };

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

void startServer();
