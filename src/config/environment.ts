import dotenv from 'dotenv';
import { z } from 'zod';
dotenv.config();

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.coerce.number().default(3000),
    DATABASE_URL: z.string().url('Invalid database URL'),
    JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
    JWT_EXPIRE: z.string().default('15m'),
    JWT_REFRESH_EXPIRE: z.string().default('7d'),
    ACCESS_TOKEN_EXPIRE: z.string().default('15m'),
    CORS_ORIGIN: z.string().default('http://localhost:3000'),
    SESSION_SECRET: z.string().min(32, 'SESSION_SECRET must be at least 32 characters'),
    CLOUDINARY_CLOUD_NAME: z.string().optional(),
    CLOUDINARY_API_KEY: z.string().optional(),
    CLOUDINARY_API_SECRET: z.string().optional(),
});

type Environment = z.infer<typeof envSchema>;

function validateEnv(): Environment {
    const env = process.env;

    const result = envSchema.safeParse(env);

    if (!result.success) {
        console.error('❌ Invalid environment variables:');
        result.error.errors.forEach((error) => {
            console.error(`  ${error.path.join('.')}: ${error.message}`);
        });
        process.exit(1);
    }

    return result.data;
}

export const config = validateEnv();
