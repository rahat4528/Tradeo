import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding 03-restaurant-menu-management...');

  await prisma.variantOption.deleteMany({});
  await prisma.variantGroup.deleteMany({});
  await prisma.menuItem.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.menu.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.restaurant.deleteMany({});

  const restaurant = await prisma.restaurant.create({
    data: {
      name: 'Bistro Lumière',
      slug: 'bistro-lumiere',
      description: 'Artisanal French & Mediterranean bistro featuring farm-fresh local seasonal ingredients.',
      currency: 'USD',
      address: '742 Evergreen Terrace, Culinary District',
      phone: '+1 (555) 328-9901',
    },
  });

  const passwordHash = await bcrypt.hash('Chef123!@#', 10);
  await prisma.user.create({
    data: {
      email: 'chef@bistrolumiere.local',
      name: 'Chef Antoine',
      passwordHash,
      restaurantId: restaurant.id,
    },
  });

  const dinnerMenu = await prisma.menu.create({
    data: {
      restaurantId: restaurant.id,
      title: 'Dinner À La Carte',
      description: 'Served daily from 5:00 PM until close.',
      isPublished: true,
      startTime: '17:00',
      endTime: '23:00',
      daysOfWeek: '0,1,2,3,4,5,6',
      sortOrder: 1,
    },
  });

  const catMains = await prisma.category.create({
    data: {
      menuId: dinnerMenu.id,
      name: 'Main Courses',
      description: 'Signature wood-fired plates and pastas',
      sortOrder: 1,
    },
  });

  const item1 = await prisma.menuItem.create({
    data: {
      categoryId: catMains.id,
      name: 'Handcrafted Truffle Tagliatelle',
      description: 'Egg tagliatelle tossed with shaved summer black truffles, French butter, aged Parmigiano Reggiano, and cracked pepper.',
      price: 26.50,
      promoPrice: 23.00,
      calories: 640,
      prepTimeMinutes: 15,
      badge: "Chef's Special",
      isAvailable: true,
      allergens: 'Gluten,Dairy,Eggs',
      dietary: 'Vegetarian',
      ingredients: 'Durum semolina, pasture-raised eggs, black truffle, cultured butter, Parmigiano Reggiano',
    },
  });

  const sizeGroup = await prisma.variantGroup.create({
    data: {
      menuItemId: item1.id,
      name: 'Portion Size',
      minSelections: 1,
      maxSelections: 1,
    },
  });

  await prisma.variantOption.createMany({
    data: [
      { variantGroupId: sizeGroup.id, name: 'Standard Entrée', priceDelta: 0.0 },
      { variantGroupId: sizeGroup.id, name: 'Tasting Portion', priceDelta: -7.0 },
      { variantGroupId: sizeGroup.id, name: 'Family Platter (+50%)', priceDelta: 12.0 },
    ],
  });

  console.log('Seeding completed for 03-restaurant-menu-management.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
