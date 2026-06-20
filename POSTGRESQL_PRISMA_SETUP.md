# PostgreSQL & Prisma Setup Guide

## Prerequisites

- Docker and Docker Compose installed
- Node.js 18+ and npm 9+

## Quick Start

### 1. Start PostgreSQL with Docker Compose

```bash
# Start PostgreSQL and PgAdmin
docker-compose up -d

# Stop services
docker-compose down

# Stop and remove volumes (reset database)
docker-compose down -v
```

### 2. Configure Environment Variables

Copy the environment template and update with your settings:

```bash
cp .env.example .env
```

Default PostgreSQL credentials:
- **Host**: localhost
- **Port**: 5432
- **Username**: postgres
- **Password**: postgres
- **Database**: food_delivery

### 3. Generate Prisma Client

```bash
npm run db:generate
```

### 4. Create First Migration

```bash
npm run db:migrate
```

This will:
- Create a new migration file
- Apply the migration to your database
- Generate the Prisma Client

### 5. Seed Database (Optional)

```bash
npm run db:seed
```

## Available Database Commands

| Command | Description |
|---------|-------------|
| `npm run db:generate` | Generate Prisma Client |
| `npm run db:migrate` | Create and apply database migration |
| `npm run db:migrate:deploy` | Deploy pending migrations (production) |
| `npm run db:seed` | Run seed script to populate initial data |
| `npm run db:studio` | Open Prisma Studio to view/edit data |
| `npm run db:reset` | Reset database and run all migrations |
| `npm run db:push` | Push schema changes to database (development only) |

## Database Management Tools

### Prisma Studio

Interactive database explorer and editor:

```bash
npm run db:studio
```

Opens at: `http://localhost:5555`

### PgAdmin

PostgreSQL management interface:

- **URL**: http://localhost:5050
- **Email**: admin@example.com (default)
- **Password**: admin (default)

To connect to PostgreSQL in PgAdmin:
1. Click "Add New Server"
2. General tab: Name = "Food Delivery"
3. Connection tab:
   - Host: postgres
   - Port: 5432
   - Username: postgres
   - Password: postgres
   - Database: food_delivery
4. Save

## Prisma Schema Structure

The main schema file is located at `prisma/schema.prisma`.

### Key Sections

```prisma
// Generator configuration
generator client {
  provider = "prisma-client-js"
}

// Database source configuration
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Data models go here
```

## Creating Models

Example of adding a new model to `prisma/schema.prisma`:

```prisma
model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

After creating a model:

```bash
npm run db:migrate
```

## Seed Script

The seed script is located at `prisma/seed.ts` and runs when:

```bash
npm run db:seed
```

Or automatically during:

```bash
npm run db:reset
```

### Example Seed Script

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.info('🌱 Seeding database...');

  // Create test data
  await prisma.user.create({
    data: {
      email: 'admin@example.com',
      name: 'Admin User',
    },
  });

  console.info('✅ Database seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

## Database Migrations

### Understanding Migrations

Migrations are SQL files that track schema changes:

```
prisma/migrations/
├── 20240101120000_init/
│   └── migration.sql
└── 20240101120100_add_users/
    └── migration.sql
```

### Create a New Migration

```bash
npm run db:migrate
```

You'll be prompted to name the migration (e.g., "add_users_table").

### View Migration Status

```bash
npx prisma migrate status
```

### Deploy Migrations (Production)

```bash
npm run db:migrate:deploy
```

This applies pending migrations without creating new ones.

## Development Workflow

### 1. Make Schema Changes

Edit `prisma/schema.prisma`:

```prisma
model Restaurant {
  id    Int     @id @default(autoincrement())
  name  String
  email String  @unique
}
```

### 2. Create Migration

```bash
npm run db:migrate

# You'll be prompted to name the migration
# Example: "add_restaurant_model"
```

### 3. Check Results in Prisma Studio

```bash
npm run db:studio
```

### 4. Use New Models in Your Code

```typescript
import { prisma } from '@config/database';

const restaurant = await prisma.restaurant.create({
  data: {
    name: 'Pizza Place',
    email: 'pizza@example.com',
  },
});
```

## Troubleshooting

### Database Connection Issues

If you get connection errors:

1. Check PostgreSQL is running:
   ```bash
   docker-compose ps
   ```

2. Verify DATABASE_URL in `.env`:
   ```bash
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/food_delivery
   ```

3. Restart PostgreSQL:
   ```bash
   docker-compose restart postgres
   ```

### Migration Conflicts

If you have migration conflicts:

```bash
# Reset database (deletes all data)
npm run db:reset

# Or manually resolve conflicts and run
npm run db:migrate:deploy
```

### Prisma Client Out of Date

```bash
# Regenerate Prisma Client
npm run db:generate
```

## Docker Compose Services

### PostgreSQL

- **Image**: postgres:16-alpine
- **Port**: 5432
- **Volume**: postgres_data (persistent storage)
- **Health Check**: Enabled

### PgAdmin

- **Image**: dpage/pgadmin4
- **Port**: 5050
- **Depends On**: PostgreSQL (waits for healthy status)

## Best Practices

1. **Always create migrations for schema changes**
   ```bash
   npm run db:migrate
   ```

2. **Never edit migration files manually** after they're created

3. **Keep seed data realistic** for testing

4. **Use `.env.local` for local overrides** (gitignored)

5. **Commit migration files to git**, but not database data

6. **Test migrations before production deployment**
   ```bash
   npm run db:migrate:deploy
   ```

## Production Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Deploy migrations:
   ```bash
   npm run db:migrate:deploy
   ```

3. Start the application:
   ```bash
   npm start
   ```

## Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)
- [Docker Compose Documentation](https://docs.docker.com/compose)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
