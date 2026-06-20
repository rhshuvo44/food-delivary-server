#!/bin/bash

# Food Delivery Backend - Database Setup Script
# This script sets up PostgreSQL and Prisma

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🚀 Food Delivery Backend - Database Setup${NC}"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
  echo -e "${YELLOW}📋 Creating .env file from template...${NC}"
  cp .env.example .env
  echo -e "${GREEN}✅ .env file created${NC}"
  echo -e "${YELLOW}⚠️  Please update .env with your configuration if needed${NC}"
  echo ""
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
  echo -e "${RED}❌ Docker is not installed${NC}"
  echo "Please install Docker from https://www.docker.com/products/docker-desktop"
  exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
  echo -e "${RED}❌ Docker Compose is not installed${NC}"
  echo "Please install Docker Compose"
  exit 1
fi

echo -e "${YELLOW}🐘 Starting PostgreSQL...${NC}"
docker-compose up -d
echo -e "${GREEN}✅ PostgreSQL is running${NC}"
echo ""

# Wait for PostgreSQL to be ready
echo -e "${YELLOW}⏳ Waiting for PostgreSQL to be ready...${NC}"
for i in {1..30}; do
  if docker-compose exec -T postgres pg_isready -U postgres &> /dev/null; then
    echo -e "${GREEN}✅ PostgreSQL is ready${NC}"
    break
  fi
  if [ $i -eq 30 ]; then
    echo -e "${RED}❌ PostgreSQL failed to start${NC}"
    exit 1
  fi
  sleep 1
done
echo ""

# Generate Prisma Client
echo -e "${YELLOW}🔧 Generating Prisma Client...${NC}"
npm run db:generate
echo -e "${GREEN}✅ Prisma Client generated${NC}"
echo ""

# Create and apply migrations
echo -e "${YELLOW}📦 Running database migrations...${NC}"
npm run db:migrate
echo -e "${GREEN}✅ Database migrations completed${NC}"
echo ""

# Optional: Run seed
read -p "Do you want to seed the database? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo -e "${YELLOW}🌱 Seeding database...${NC}"
  npm run db:seed
  echo -e "${GREEN}✅ Database seeded${NC}"
fi
echo ""

echo -e "${GREEN}✅ Database setup completed!${NC}"
echo ""
echo -e "${YELLOW}📚 Quick reference:${NC}"
echo "  npm run db:generate    - Generate Prisma Client"
echo "  npm run db:migrate     - Create/apply migrations"
echo "  npm run db:seed        - Seed the database"
echo "  npm run db:studio      - Open Prisma Studio"
echo "  docker-compose down    - Stop services"
echo "  docker-compose down -v - Stop and reset database"
echo ""
echo -e "${YELLOW}🌐 Access points:${NC}"
echo "  PgAdmin: http://localhost:5050"
echo "  Prisma Studio: Run 'npm run db:studio'"
echo ""
