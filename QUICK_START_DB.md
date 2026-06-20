# Quick Start: PostgreSQL & Prisma Setup

## 🎯 One-Command Setup

### For Windows (PowerShell)
```powershell
.\scripts\setup-db.ps1
```

### For macOS/Linux (Bash)
```bash
bash scripts/setup-db.sh
```

These scripts will:
1. ✅ Create `.env` file from template
2. ✅ Start PostgreSQL container with Docker
3. ✅ Generate Prisma Client
4. ✅ Run database migrations
5. ✅ Optionally seed the database

---

## 📋 Manual Setup Steps

### Step 1: Configure Environment
```bash
cp .env.example .env
```

Edit `.env` and update if needed (defaults work for local development):
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/food_delivery
NODE_ENV=development
PORT=3000
```

### Step 2: Start PostgreSQL
```bash
docker-compose up -d
```

Verify it's running:
```bash
docker-compose ps
```

### Step 3: Generate Prisma Client
```bash
npm run db:generate
```

### Step 4: Run Migrations
```bash
npm run db:migrate
```

You'll be prompted to name your first migration (e.g., "init").

### Step 5: (Optional) Seed Database
```bash
npm run db:seed
```

---

## 🔍 Verify Setup

### Check PostgreSQL
```bash
docker-compose ps
```

Should show `postgres` and `pgadmin` services as `Up`.

### Access PgAdmin
1. Open http://localhost:5050
2. Login with: admin@example.com / admin
3. Add PostgreSQL server connection:
   - Host: postgres
   - Port: 5432
   - Username: postgres
   - Password: postgres

### View Database with Prisma Studio
```bash
npm run db:studio
```

Opens interactive database explorer at http://localhost:5555

---

## 📦 Database Command Reference

| Command | Purpose |
|---------|---------|
| `npm run db:generate` | Generate/update Prisma Client |
| `npm run db:migrate` | Create new migration |
| `npm run db:migrate:deploy` | Deploy migrations (production) |
| `npm run db:seed` | Run seed script |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:reset` | Reset database (⚠️ deletes data) |
| `npm run db:push` | Push schema changes (dev only) |

---

## 🐳 Docker Compose Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Stop and reset database
docker-compose down -v

# View logs
docker-compose logs postgres

# Restart PostgreSQL
docker-compose restart postgres
```

---

## 💡 Common Workflows

### Create a New Model

1. **Edit schema**
```bash
# Open prisma/schema.prisma and add:
model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

2. **Create migration**
```bash
npm run db:migrate

# Enter migration name: "add_user_model"
```

3. **Check Prisma Studio**
```bash
npm run db:studio
```

### Use Models in Code

```typescript
import { prisma } from '@config/database';

// Create
const user = await prisma.user.create({
  data: {
    email: 'user@example.com',
    name: 'John Doe',
  },
});

// Read
const user = await prisma.user.findUnique({
  where: { email: 'user@example.com' },
});

// Update
const user = await prisma.user.update({
  where: { id: 1 },
  data: { name: 'Jane Doe' },
});

// Delete
await prisma.user.delete({
  where: { id: 1 },
});
```

### Update Seed Script

Edit `prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.info('🌱 Seeding database...');

  // Create test user
  const user = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      name: 'Admin User',
    },
  });

  console.info('✅ User created:', user);
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

Then run:
```bash
npm run db:seed
```

---

## 🚨 Troubleshooting

### PostgreSQL won't start
```bash
# Check if port 5432 is in use
# Stop other PostgreSQL services or change DB_PORT in .env

# Restart
docker-compose down -v
docker-compose up -d
```

### Prisma Client not found
```bash
npm run db:generate
```

### Migration conflicts
```bash
# Reset everything (loses data)
npm run db:reset

# Or view migration status
npx prisma migrate status
```

### Can't connect to database
1. Verify PostgreSQL is running: `docker-compose ps`
2. Check DATABASE_URL in `.env`
3. Verify credentials in docker-compose.yml

---

## 📚 Learn More

- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs)
- [Docker Compose Docs](https://docs.docker.com/compose)
- Full guide: [POSTGRESQL_PRISMA_SETUP.md](./POSTGRESQL_PRISMA_SETUP.md)

---

## ✅ Next Steps

1. ✅ PostgreSQL & Prisma configured
2. ⬜ Create data models (Users, Restaurants, Orders, etc.)
3. ⬜ Build API routes
4. ⬜ Add authentication
5. ⬜ Deploy to production

Happy coding! 🚀
