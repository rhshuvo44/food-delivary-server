// import { OrderStatus, PaymentMethod, PrismaClient } from './prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { config } from '../src/config/environment';
import { OrderStatus, PaymentMethod, PrismaClient } from '../src/generated/prisma/client';

const pool = new Pool({ connectionString: config.DATABASE_URL });
const adapter = new PrismaPg(pool);
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient({
  adapter,
  log: ['error', 'warn'],
});

const PASSWORD = 'Password123';

const customerNames = [
    ['Aarav', 'Rahman'],
    ['Nusrat', 'Jahan'],
    ['Tanvir', 'Ahmed'],
    ['Farhana', 'Karim'],
    ['Sadia', 'Islam'],
    ['Rafi', 'Hossain'],
    ['Maliha', 'Chowdhury'],
    ['Imran', 'Hasan'],
    ['Tasmia', 'Akter'],
    ['Sami', 'Khan'],
    ['Nabila', 'Sultana'],
    ['Fahim', 'Mahmud'],
    ['Orin', 'Rahman'],
    ['Tahmid', 'Sarker'],
    ['Mim', 'Begum'],
    ['Rayan', 'Kabir'],
    ['Jarin', 'Haque'],
    ['Sakib', 'Alam'],
    ['Anika', 'Noor'],
    ['Shuvo', 'Das'],
] as const;

const restaurantSeeds = [
    {
        name: 'Dhaka Spice House',
        description: 'Modern Bangladeshi comfort food with biryani, bhuna, kebabs, and fragrant rice plates.',
        cuisineType: 'Bangladeshi',
        email: 'hello@dhakaspicehouse.test',
        phone: '+8801701000001',
        website: 'https://dhakaspicehouse.test',
        logoUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5',
        coverUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836',
        address: {
            line1: '22 Road 11',
            line2: 'Banani',
            city: 'Dhaka',
            state: 'Dhaka',
            postalCode: '1213',
            country: 'Bangladesh',
            latitude: '23.7945000',
            longitude: '90.4043000',
        },
        categories: [
            {
                name: 'Biryani',
                description: 'Aromatic rice dishes cooked with layered spices and tender protein.',
                foods: [
                    ['Kacchi Biryani', 'Slow-cooked mutton kacchi with potato, egg, and basmati rice.', 339, true],
                    ['Chicken Tehari', 'Mustard-oil chicken tehari with fragrant short-grain rice.', 249, false],
                    ['Beef Morog Polao', 'Rich beef and chicken polao with sweet spices and ghee.', 319, true],
                    ['Vegetable Biryani', 'Seasonal vegetables with saffron rice, nuts, and raita.', 219, false],
                    ['Mutton Biryani Box', 'Single-serve mutton biryani with salad and borhani.', 369, true],
                ],
            },
            {
                name: 'Curries',
                description: 'Traditional gravies, bhuna dishes, and homestyle mains.',
                foods: [
                    ['Beef Bhuna', 'Tender beef cooked down with onion, chili, and roasted spices.', 289, true],
                    ['Chicken Rezala', 'Creamy Mughlai chicken curry finished with kewra and cashew.', 279, false],
                    ['Mutton Korma', 'Mild mutton curry with yogurt, ghee, and whole spices.', 349, true],
                    ['Rui Fish Curry', 'River fish simmered in turmeric, tomato, and green chili gravy.', 259, false],
                    ['Dal Tadka', 'Yellow lentils tempered with garlic, cumin, and dried chili.', 139, false],
                ],
            },
            {
                name: 'Kebabs',
                description: 'Charcoal grilled kebabs and tandoor favorites.',
                foods: [
                    ['Chicken Boti Kebab', 'Smoky chicken cubes marinated with yogurt and house masala.', 259, true],
                    ['Beef Seekh Kebab', 'Minced beef skewers grilled with herbs and green chili.', 279, false],
                    ['Tandoori Chicken Half', 'Classic tandoori chicken with mint chutney and salad.', 329, true],
                    ['Paneer Tikka', 'Grilled paneer cubes with capsicum and onion.', 239, false],
                    ['Garlic Naan', 'Soft naan brushed with butter and roasted garlic.', 89, false],
                ],
            },
            {
                name: 'Drinks',
                description: 'Refreshing drinks, lassi, borhani, and tea.',
                foods: [
                    ['Borhani', 'Spiced yogurt drink with mint and roasted cumin.', 79, true],
                    ['Sweet Lassi', 'Thick chilled yogurt drink with a sweet cardamom finish.', 99, false],
                    ['Lemon Mint Cooler', 'Fresh lemon, mint, and soda over ice.', 89, false],
                ],
            },
        ],
    },
    {
        name: 'Urban Burger Lab',
        description: 'Craft burgers, loaded fries, wings, and shakes built for late-night cravings.',
        cuisineType: 'American',
        email: 'orders@urbanburgerlab.test',
        phone: '+8801701000002',
        website: 'https://urbanburgerlab.test',
        logoUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd',
        coverUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349',
        address: {
            line1: 'House 48, Road 27',
            line2: 'Dhanmondi',
            city: 'Dhaka',
            state: 'Dhaka',
            postalCode: '1209',
            country: 'Bangladesh',
            latitude: '23.7465000',
            longitude: '90.3760000',
        },
        categories: [
            {
                name: 'Burgers',
                description: 'Smashed patties, crispy chicken, and loaded burger stacks.',
                foods: [
                    ['Classic Smash Burger', 'Double smashed beef patties with cheddar and lab sauce.', 299, true],
                    ['Crispy Chicken Burger', 'Buttermilk fried chicken with slaw and spicy mayo.', 279, true],
                    ['Mushroom Swiss Burger', 'Beef patty with sauteed mushrooms and Swiss cheese.', 339, false],
                    ['BBQ Bacon Burger', 'Smoky barbecue beef burger with turkey bacon and onions.', 369, true],
                    ['Veggie Bean Burger', 'Spiced bean patty with lettuce, tomato, and chipotle sauce.', 249, false],
                    ['Nashville Hot Burger', 'Fiery crispy chicken with pickles and ranch.', 319, true],
                ],
            },
            {
                name: 'Sides',
                description: 'Fries, wings, nuggets, and sharing bites.',
                foods: [
                    ['Loaded Cheese Fries', 'Crispy fries with cheese sauce, jalapeno, and garlic mayo.', 199, true],
                    ['Buffalo Wings', 'Six wings tossed in tangy buffalo sauce.', 259, false],
                    ['Chicken Nuggets', 'Crispy chicken bites with honey mustard dip.', 179, false],
                    ['Onion Rings', 'Golden onion rings with smoky aioli.', 149, false],
                    ['Truffle Fries', 'Fries tossed with parmesan, parsley, and truffle oil.', 229, true],
                ],
            },
            {
                name: 'Shakes',
                description: 'Creamy milkshakes and cold sweet drinks.',
                foods: [
                    ['Chocolate Fudge Shake', 'Thick chocolate shake with brownie crumble.', 219, true],
                    ['Strawberry Cheesecake Shake', 'Strawberry shake blended with cheesecake bits.', 239, false],
                    ['Salted Caramel Shake', 'Caramel shake with sea salt and whipped cream.', 229, true],
                    ['Oreo Crunch Shake', 'Vanilla shake blended with crushed Oreo cookies.', 219, false],
                ],
            },
        ],
    },
    {
        name: 'Sakura Sushi & Ramen',
        description: 'Fresh sushi rolls, hearty ramen bowls, rice plates, and Japanese sides.',
        cuisineType: 'Japanese',
        email: 'contact@sakurasushi.test',
        phone: '+8801701000003',
        website: 'https://sakurasushi.test',
        logoUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c',
        coverUrl: 'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56',
        address: {
            line1: 'Plot 12, Block C',
            line2: 'Bashundhara R/A',
            city: 'Dhaka',
            state: 'Dhaka',
            postalCode: '1229',
            country: 'Bangladesh',
            latitude: '23.8151000',
            longitude: '90.4255000',
        },
        categories: [
            {
                name: 'Sushi Rolls',
                description: 'Fresh rolls with fish, vegetables, and house sauces.',
                foods: [
                    ['Salmon Avocado Roll', 'Salmon, avocado, cucumber, and sesame.', 429, true],
                    ['Spicy Tuna Roll', 'Tuna, chili mayo, scallion, and cucumber.', 449, true],
                    ['California Roll', 'Crab stick, avocado, cucumber, and tobiko.', 379, false],
                    ['Tempura Prawn Roll', 'Crispy prawn tempura with spicy mayo.', 419, true],
                    ['Vegetable Maki', 'Carrot, cucumber, avocado, and pickled radish.', 279, false],
                    ['Dragon Roll', 'Eel-style glazed roll with avocado and sesame.', 499, true],
                ],
            },
            {
                name: 'Ramen',
                description: 'Warm noodle bowls with rich broth and toppings.',
                foods: [
                    ['Chicken Shoyu Ramen', 'Soy-based chicken broth with noodles, egg, and nori.', 399, true],
                    ['Beef Miso Ramen', 'Miso broth with sliced beef, corn, and scallion.', 449, true],
                    ['Seafood Ramen', 'Prawn, squid, fish cake, and vegetables in clear broth.', 489, false],
                    ['Vegetable Ramen', 'Mushroom broth with tofu, greens, and ramen noodles.', 339, false],
                    ['Spicy Tantanmen', 'Sesame chili broth with minced chicken and bok choy.', 429, true],
                ],
            },
            {
                name: 'Rice Bowls',
                description: 'Donburi-style bowls over steamed rice.',
                foods: [
                    ['Chicken Katsu Don', 'Crispy chicken cutlet over rice with egg and onion.', 349, true],
                    ['Teriyaki Beef Bowl', 'Beef strips glazed with teriyaki over steamed rice.', 399, false],
                    ['Salmon Poke Bowl', 'Salmon, edamame, cucumber, avocado, and sushi rice.', 479, true],
                    ['Tofu Teriyaki Bowl', 'Crispy tofu, vegetables, and teriyaki sauce.', 299, false],
                    ['Prawn Tempura Don', 'Tempura prawns over rice with tentsuyu sauce.', 429, true],
                ],
            },
            {
                name: 'Japanese Sides',
                description: 'Small plates and sides for sharing.',
                foods: [
                    ['Chicken Gyoza', 'Pan-fried dumplings with soy vinegar dip.', 249, true],
                    ['Edamame', 'Steamed soybeans with sea salt.', 159, false],
                    ['Miso Soup', 'Classic miso broth with tofu, wakame, and scallion.', 129, false],
                    ['Prawn Tempura', 'Crispy tempura prawns with dipping sauce.', 369, true],
                ],
            },
        ],
    },
] as const;

function seededEmails(): string[] {
    return [
        'admin@food.local',
        ...customerNames.map((_, index) => `customer${String(index + 1).padStart(2, '0')}@food.local`),
    ];
}

function roundMoney(value: number): number {
    return Number(value.toFixed(2));
}

async function cleanSeedData(): Promise<void> {
    const restaurants = await prisma.restaurant.findMany({
        where: { email: { in: restaurantSeeds.map(restaurant => restaurant.email) } },
        select: { id: true },
    });
    const users = await prisma.user.findMany({
        where: { email: { in: seededEmails() } },
        select: { id: true },
    });

    const restaurantIds = restaurants.map((restaurant:any) => restaurant.id);
    const userIds = users.map((user:any) => user.id);

    const orderFilters = [
        ...(restaurantIds.length ? [{ restaurantId: { in: restaurantIds } }] : []),
        ...(userIds.length ? [{ userId: { in: userIds } }] : []),
    ];
    const orders = orderFilters.length
        ? await prisma.order.findMany({
            where: { OR: orderFilters },
            select: { id: true },
        })
        : [];
    const orderIds = orders.map((order:any) => order.id);

    if (orderIds.length) {
        await prisma.review.deleteMany({ where: { orderId: { in: orderIds } } });
        await prisma.orderHistory.deleteMany({ where: { orderId: { in: orderIds } } });
        await prisma.orderItem.deleteMany({ where: { orderId: { in: orderIds } } });
        await prisma.order.deleteMany({ where: { id: { in: orderIds } } });
    }

    if (restaurantIds.length) {
        await prisma.banner.deleteMany({ where: { restaurantId: { in: restaurantIds } } });
        await prisma.coupon.deleteMany({ where: { restaurantId: { in: restaurantIds } } });
        await prisma.wishlist.deleteMany({ where: { food: { restaurantId: { in: restaurantIds } } } });
        await prisma.cartItem.deleteMany({ where: { food: { restaurantId: { in: restaurantIds } } } });
        await prisma.food.deleteMany({ where: { restaurantId: { in: restaurantIds } } });
        await prisma.category.deleteMany({ where: { restaurantId: { in: restaurantIds } } });
        await prisma.address.deleteMany({ where: { restaurantId: { in: restaurantIds } } });
        await prisma.restaurant.deleteMany({ where: { id: { in: restaurantIds } } });
    }

    if (userIds.length) {
        await prisma.cartItem.deleteMany({ where: { cart: { userId: { in: userIds } } } });
        await prisma.cart.deleteMany({ where: { userId: { in: userIds } } });
        await prisma.address.deleteMany({ where: { userId: { in: userIds } } });
        await prisma.user.updateMany({
            where: {
                OR: [
                    { createdById: { in: userIds } },
                    { updatedById: { in: userIds } },
                    { deletedById: { in: userIds } },
                ],
            },
            data: {
                createdById: null,
                updatedById: null,
                deletedById: null,
            },
        });
        await prisma.user.deleteMany({ where: { id: { in: userIds } } });
    }
}

async function main(): Promise<void> {
    console.info('Starting database seed...');

    const password = await bcrypt.hash(PASSWORD, 12);

    await cleanSeedData();

    const admin = await prisma.user.create({
        data: {
            firstName: 'System',
            lastName: 'Admin',
            email: 'admin@food.local',
            phone: '+8801999000000',
            password,
            role: 'ADMIN',
            isEmailVerified: true,
        },
    });

    const customers = await Promise.all(
        customerNames.map(([firstName, lastName], index) =>
            prisma.user.create({
                data: {
                    firstName,
                    lastName,
                    email: `customer${String(index + 1).padStart(2, '0')}@food.local`,
                    phone: `+8801888${String(index + 1).padStart(6, '0')}`,
                    password,
                    role: 'CUSTOMER',
                    isEmailVerified: true,
                    createdById: admin.id,
                    updatedById: admin.id,
                },
            }),
        ),
    );

    const customerAddresses = await Promise.all(
        customers.map((customer, index) =>
            prisma.address.create({
                data: {
                    userId: customer.id,
                    label: 'Home',
                    line1: `${18 + index} Lake View Road`,
                    line2: ['Uttara', 'Mirpur', 'Mohammadpur', 'Banasree'][index % 4],
                    city: 'Dhaka',
                    state: 'Dhaka',
                    postalCode: ['1230', '1216', '1207', '1219'][index % 4],
                    country: 'Bangladesh',
                    latitude: (23.74 + index * 0.002).toFixed(7),
                    longitude: (90.36 + index * 0.002).toFixed(7),
                    isDefault: true,
                    createdById: customer.id,
                    updatedById: customer.id,
                },
            }),
        ),
    );

    const restaurants = [];
    const categories = [];
    const foods: any = [];

    for (const restaurantSeed of restaurantSeeds) {
        const restaurant = await prisma.restaurant.create({
            data: {
                ownerId: admin.id,
                name: restaurantSeed.name,
                description: restaurantSeed.description,
                phone: restaurantSeed.phone,
                email: restaurantSeed.email,
                website: restaurantSeed.website,
                logoUrl: restaurantSeed.logoUrl,
                coverUrl: restaurantSeed.coverUrl,
                cuisineType: restaurantSeed.cuisineType,
                rating: 4.5,
                isOpen: true,
                isActive: true,
                createdById: admin.id,
                updatedById: admin.id,
            },
        });

        const address = await prisma.address.create({
            data: {
                restaurantId: restaurant.id,
                label: 'Restaurant',
                line1: restaurantSeed.address.line1,
                line2: restaurantSeed.address.line2,
                city: restaurantSeed.address.city,
                state: restaurantSeed.address.state,
                postalCode: restaurantSeed.address.postalCode,
                country: restaurantSeed.address.country,
                latitude: restaurantSeed.address.latitude,
                longitude: restaurantSeed.address.longitude,
                isDefault: true,
                createdById: admin.id,
                updatedById: admin.id,
            },
        });

        const restaurantWithAddress = await prisma.restaurant.update({
            where: { id: restaurant.id },
            data: { addressId: address.id },
        });
        restaurants.push(restaurantWithAddress);

        for (const [categoryIndex, categorySeed] of restaurantSeed.categories.entries()) {
            const category = await prisma.category.create({
                data: {
                    restaurantId: restaurant.id,
                    name: categorySeed.name,
                    description: categorySeed.description,
                    sortOrder: categoryIndex,
                    createdById: admin.id,
                    updatedById: admin.id,
                },
            });
            categories.push(category);

            for (const [foodIndex, foodSeed] of categorySeed.foods.entries()) {
                const [name, description, price, isFeatured] = foodSeed;
                const food = await prisma.food.create({
                    data: {
                        restaurantId: restaurant.id,
                        categoryId: category.id,
                        name,
                        description,
                        price,
                        imageUrl: `https://images.unsplash.com/photo-${1510000000000 + foods.length}`,
                        isAvailable: true,
                        isFeatured,
                        calories: 220 + ((foods.length + foodIndex) % 9) * 55,
                        preparationTime: 12 + ((foods.length + foodIndex) % 6) * 4,
                        createdById: admin.id,
                        updatedById: admin.id,
                    },
                });
                foods.push(food);
            }
        }
    }

    const foodsByRestaurant = restaurants.reduce<Record<string, typeof foods>>((acc, restaurant) => {
        acc[restaurant.id] = foods.filter((food:any) => food.restaurantId === restaurant.id);
        return acc;
    }, {});

    const orderStatuses:OrderStatus[] = [
        'DELIVERED',
        'DELIVERED',
        'DELIVERED',
        'READY',
        'PREPARING',
        'ACCEPTED',
        'PENDING',
        'CANCELLED',
    ];
    const paymentMethods:PaymentMethod[] = ['ONLINE', 'CASH', 'CARD', 'WALLET'];

    for (let index = 0; index < 20; index += 1) {
        const customer = customers[index]!;
        const address = customerAddresses[index]!;
        const restaurant = restaurants[index % restaurants.length]!;
        const restaurantFoods = foodsByRestaurant[restaurant.id]!;
        const selectedFoods = [
            restaurantFoods[index % restaurantFoods.length]!,
            restaurantFoods[(index + 5) % restaurantFoods.length]!,
            restaurantFoods[(index + 11) % restaurantFoods.length]!,
        ];

        const orderItems = selectedFoods.map((food, itemIndex) => {
            const quantity = itemIndex === 0 && index % 3 === 0 ? 2 : 1;
            const unitPrice = Number(food.price);
            return {
                foodId: food.id,
                quantity,
                unitPrice,
                totalPrice: roundMoney(unitPrice * quantity),
            };
        });

        const subTotal = roundMoney(orderItems.reduce((sum, item) => sum + item.totalPrice, 0));
        const deliveryFee = index % 4 === 0 ? 0 : 60;
        const taxAmount = roundMoney(subTotal * 0.05);
        const discountAmount = index % 5 === 0 ? 50 : 0;
        const tipAmount = index % 6 === 0 ? 30 : 0;
        const totalAmount = roundMoney(subTotal + deliveryFee + taxAmount + tipAmount - discountAmount);
        const status = orderStatuses[index % orderStatuses.length];
        const placedAt = new Date(Date.now() - (index + 1) * 24 * 60 * 60 * 1000);
        const deliveredAt = status === 'DELIVERED' ? new Date(placedAt.getTime() + 55 * 60 * 1000) : undefined;
        const canceledAt = status === 'CANCELLED' ? new Date(placedAt.getTime() + 12 * 60 * 1000) : undefined;

        await prisma.order.create({
            data: {
                userId: customer.id,
                restaurantId: restaurant.id,
                addressId: address.id,
                orderStatus: status,
                paymentMethod: paymentMethods[index % paymentMethods.length],
                subTotal,
                deliveryFee,
                taxAmount,
                discountAmount,
                totalAmount,
                tipAmount,
                instructions: index % 2 === 0 ? 'Please keep the spice level medium and include extra napkins.' : undefined,
                placedAt,
                deliveredAt,
                canceledAt,
                createdById: customer.id,
                updatedById: admin.id,
                items: {
                    create: orderItems,
                },
                history: {
                    create: [
                        {
                            currentStatus: 'PENDING',
                            note: 'Order placed from seed data',
                            changedById: customer.id,
                            createdAt: placedAt,
                        },
                        ...(status !== OrderStatus.PENDING
                            ? [
                                {
                                    previousStatus: OrderStatus.PENDING,
                                    currentStatus: status,
                                    note: `Order moved to ${status}`,
                                    changedById: admin.id,
                                    createdAt: new Date(placedAt.getTime() + 10 * 60 * 1000),
                                },
                            ]
                            : []),
                    ],
                },
            },
        });
    }

    console.info('Seed completed successfully');
    console.info(`Admin: admin@food.local / ${PASSWORD}`);
    console.info(`Created: 1 admin, ${restaurants.length} restaurants, ${categories.length} categories, ${foods.length} foods, ${customers.length} customers, 20 orders`);
}

main()
    .catch(error => {
        console.error('Error seeding database:', error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
