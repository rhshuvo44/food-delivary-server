import { PrismaClient, Role, OrderStatus, PaymentMethod } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // 1. Clean existing data
  await prisma.banner.deleteMany();
  await prisma.user.deleteMany();

  // 2. Seed Admin and Vendor
  const vendor = await prisma.user.create({
    data: {
      name: 'John Vendor',
      email: 'vendor@foodpanda.com',
      password: 'hashed_password_here', // Real app usage bCrypt/Argon2
      role: Role.RESTAURANT_OWNER,
      restaurants: {
        create: {
          name: 'Burger King',
          description: 'Best flame-broiled burgers!',
          address: 'Gulshan 2, Dhaka',
          location: { type: 'Point', coordinates: [90.4152, 23.7925] }, // [lng, lat]
          categories: {
            create: {
              name: 'Premium Burgers',
              foods: {
                create: {
                  name: 'Whopper Cheese Burger',
                  description: 'Flame-broiled beef patty with cheese',
                  price: 450.00,
                  imageUrl: 'https://images.com/whopper.png'
                }
              }
            }
          }
        }
      }
    }
  });

  // 3. Seed Promotional Banner
  await prisma.banner.create({
    data: {
      title: '50% Flat Discount on First Order',
      imageUrl: 'https://images.com/banner1.png',
      redirectUrl: '/collection/first-order'
    }
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });