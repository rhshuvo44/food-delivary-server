-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Set default timezone
SET TIMEZONE = 'UTC';

-- Create schemas
CREATE SCHEMA IF NOT EXISTS public;

GRANT ALL PRIVILEGES ON SCHEMA public TO postgres;
