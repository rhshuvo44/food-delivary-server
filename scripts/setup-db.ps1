# Food Delivery Backend - Database Setup Script (Windows)
# This script sets up PostgreSQL and Prisma

param(
    [switch]$SkipDocker = $false
)

Write-Host "🚀 Food Delivery Backend - Database Setup" -ForegroundColor Yellow
Write-Host ""

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "📋 Creating .env file from template..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✅ .env file created" -ForegroundColor Green
    Write-Host "⚠️  Please update .env with your configuration if needed" -ForegroundColor Yellow
    Write-Host ""
}

# Check if Docker is installed
if (-not $SkipDocker) {
    $dockerCheck = docker --version 2>$null
    if (-not $dockerCheck) {
        Write-Host "❌ Docker is not installed" -ForegroundColor Red
        Write-Host "Please install Docker Desktop from https://www.docker.com/products/docker-desktop"
        exit 1
    }

    Write-Host "🐘 Starting PostgreSQL..." -ForegroundColor Yellow
    docker-compose up -d
    Write-Host "✅ PostgreSQL is running" -ForegroundColor Green
    Write-Host ""

    # Wait for PostgreSQL to be ready
    Write-Host "⏳ Waiting for PostgreSQL to be ready..." -ForegroundColor Yellow
    $maxAttempts = 30
    $attempt = 0
    while ($attempt -lt $maxAttempts) {
        try {
            $check = docker-compose exec -T postgres pg_isready -U postgres 2>$null
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ PostgreSQL is ready" -ForegroundColor Green
                break
            }
        }
        catch {
            # Ignore errors during attempts
        }
        if ($attempt -eq $maxAttempts - 1) {
            Write-Host "❌ PostgreSQL failed to start" -ForegroundColor Red
            exit 1
        }
        Start-Sleep -Seconds 1
        $attempt++
    }
    Write-Host ""
}

# Generate Prisma Client
Write-Host "🔧 Generating Prisma Client..." -ForegroundColor Yellow
npm run db:generate
Write-Host "✅ Prisma Client generated" -ForegroundColor Green
Write-Host ""

# Create and apply migrations
Write-Host "📦 Running database migrations..." -ForegroundColor Yellow
npm run db:migrate
Write-Host "✅ Database migrations completed" -ForegroundColor Green
Write-Host ""

# Optional: Run seed
$response = Read-Host "Do you want to seed the database? (y/n)"
if ($response -eq "y" -or $response -eq "Y") {
    Write-Host "🌱 Seeding database..." -ForegroundColor Yellow
    npm run db:seed
    Write-Host "✅ Database seeded" -ForegroundColor Green
}
Write-Host ""

Write-Host "✅ Database setup completed!" -ForegroundColor Green
Write-Host ""

Write-Host "📚 Quick reference:" -ForegroundColor Yellow
Write-Host "  npm run db:generate    - Generate Prisma Client"
Write-Host "  npm run db:migrate     - Create/apply migrations"
Write-Host "  npm run db:seed        - Seed the database"
Write-Host "  npm run db:studio      - Open Prisma Studio"
Write-Host "  docker-compose down    - Stop services"
Write-Host "  docker-compose down -v - Stop and reset database"
Write-Host ""

Write-Host "🌐 Access points:" -ForegroundColor Yellow
Write-Host "  PgAdmin: http://localhost:5050"
Write-Host "  Prisma Studio: Run 'npm run db:studio'"
Write-Host ""
