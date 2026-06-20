import dotenv from 'dotenv';
import { connectDatabase, disconnectDatabase } from "./config/database";
import { config } from "./config/environment";
import { app } from "./presentation/app";
dotenv.config();
const PORT = config.PORT;

async function startServer(): Promise<void> {
    try {
        await connectDatabase();

        const server = app.listen(PORT, () => {
            console.info(`✅ Server running on http://localhost:${PORT}`);
            console.info(`📝 Environment: ${config.NODE_ENV}`);
        });

        const gracefulShutdown = async (): Promise<void> => {
            console.info('\n⏹️  Shutting down gracefully...');
            server.close(async () => {
                await disconnectDatabase();
                console.info('✅ Database disconnected');
                process.exit(0);
            });
        };

        process.on('SIGTERM', gracefulShutdown);
        process.on('SIGINT', gracefulShutdown);
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

startServer();
