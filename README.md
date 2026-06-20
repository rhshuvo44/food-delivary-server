# Food Delivery Backend

A production-ready Express.js backend built with TypeScript for food delivery application.

## Tech Stack

- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT + Bcrypt
- **Validation**: Zod
- **Security**: Helmet
- **Logging**: Morgan
- **Code Quality**: ESLint, Prettier

## Project Structure

```
src/
├── config/              # Configuration files (database, environment, logger, etc.)
├── middlewares/         # Custom middlewares (error handler, validators, etc.)
├── modules/             # Business logic modules (to be created)
├── routes/              # API routes (to be created)
├── utils/               # Utility functions and helpers
└── index.ts             # Application entry point
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+ or yarn
- PostgreSQL 12+

### Installation

1. Install dependencies:

```bash
npm install
```

2. Set up environment variables:

```bash
cp .env.example .env
```

Update the `.env` file with your configuration.

3. Set up the database:

```bash
npm run prisma:generate
npm run prisma:migrate
```

### Development

Start the development server:

```bash
npm run dev
```

The server will run on `http://localhost:3000` by default.

### Build

Build for production:

```bash
npm run build
```

### Production

Run the production build:

```bash
npm start
```

## Scripts

| Command                   | Description                              |
| ------------------------- | ---------------------------------------- |
| `npm run dev`             | Start development server with hot reload |
| `npm run build`           | Build TypeScript to JavaScript           |
| `npm start`               | Run production server                    |
| `npm run lint`            | Run ESLint                               |
| `npm run lint:fix`        | Fix ESLint errors                        |
| `npm run format`          | Format code with Prettier                |
| `npm run format:check`    | Check code formatting                    |
| `npm run type-check`      | Run TypeScript type checking             |
| `npm run prisma:generate` | Generate Prisma Client                   |
| `npm run prisma:migrate`  | Create and apply database migration      |
| `npm run prisma:deploy`   | Deploy pending migrations to production  |
| `npm run prisma:studio`   | Open Prisma Studio                       |

## API Response Format

All API responses follow this format:

### Success Response (2xx)

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {},
  "statusCode": 200
}
```

### Error Response (4xx, 5xx)

```json
{
  "success": false,
  "message": "Error message",
  "error": "Optional detailed error",
  "statusCode": 400
}
```

## Environment Variables

| Variable         | Description                                 | Default               |
| ---------------- | ------------------------------------------- | --------------------- |
| `NODE_ENV`       | Environment (development, production, test) | development           |
| `PORT`           | Server port                                 | 3000                  |
| `DATABASE_URL`   | PostgreSQL connection string                | -                     |
| `JWT_SECRET`     | JWT signing secret (min 32 chars)           | -                     |
| `JWT_EXPIRE`     | JWT expiration time                         | 7d                    |
| `CORS_ORIGIN`    | CORS allowed origin                         | http://localhost:3000 |
| `SESSION_SECRET` | Session secret (min 32 chars)               | -                     |

## Error Handling

The application includes a comprehensive error handling system with predefined error classes:

- `BadRequestError` (400)
- `UnauthorizedError` (401)
- `ForbiddenError` (403)
- `NotFoundError` (404)
- `ConflictError` (409)
- `ValidationError` (422)
- `InternalServerError` (500)

## Database Migrations

### Create a new migration

```bash
npm run prisma:migrate
```

This will prompt you to name the migration and create the migration files.

### Apply migrations in production

```bash
npm run prisma:deploy
```

## Code Quality

### Linting

```bash
npm run lint
npm run lint:fix
```

### Formatting

```bash
npm run format
npm run format:check
```

### Type Checking

```bash
npm run type-check
```

## Security Best Practices

- Environment variables are validated using Zod
- Passwords are hashed using Bcrypt
- JWT tokens are used for authentication
- CORS is properly configured
- Helmet is used for HTTP header security
- Input validation is enforced

## License

ISC

## Contributing

1. Follow the code style enforced by ESLint and Prettier
2. Write TypeScript with strict type checking
3. Create meaningful commit messages
4. Keep functions small and focused
5. Add error handling for all operations
