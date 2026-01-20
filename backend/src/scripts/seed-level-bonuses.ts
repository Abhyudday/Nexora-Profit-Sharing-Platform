import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seed script to initialize level bonus percentages in system config
 * Level bonuses are collected from company profit sharing
 */
async function seedLevelBonuses() {
  try {
    console.log('Seeding level bonus percentages...');

    // SkyEast level bonus percentages (7 levels, total 20%)
    // Based on profit sharing: 60% investor, 20% Marketing Plan, 20% developer
    const levelBonuses = [
      { level: 1, percentage: 5 },
      { level: 2, percentage: 2 },
      { level: 3, percentage: 2 },
      { level: 4, percentage: 2 },
      { level: 5, percentage: 2 },
      { level: 6, percentage: 3 },
      { level: 7, percentage: 4 },
    ];

    await prisma.systemConfig.upsert({
      where: { key: 'LEVEL_BONUS_PERCENTAGES' },
      update: {
        value: JSON.stringify(levelBonuses),
        description: 'Level bonus percentages (collected from company profit sharing)',
      },
      create: {
        key: 'LEVEL_BONUS_PERCENTAGES',
        value: JSON.stringify(levelBonuses),
        description: 'Level bonus percentages (collected from company profit sharing)',
      },
    });

    console.log('✓ Level bonus percentages seeded successfully');

    // Also seed rank information for reference
    const rankInfo = {
      STARTER: {
        minBalance: 100,
        maxBalance: 499,
        bonusLevels: 0,
        profitShareUser: 50,
        profitShareCompany: 50,
      },
      BEGINNER: {
        minBalance: 500,
        maxBalance: 999,
        bonusLevels: 3,
        profitShareUser: 60,
        profitShareCompany: 40,
      },
      INVESTOR: {
        minBalance: 1000,
        maxBalance: 4999,
        bonusLevels: 7,
        profitShareUser: 70,
        profitShareCompany: 30,
      },
      VIP: {
        minBalance: 5000,
        maxBalance: 9999,
        bonusLevels: 7,
        profitShareUser: 80,
        profitShareCompany: 20,
      },
      VVIP: {
        minBalance: 10000,
        maxBalance: null,
        bonusLevels: 7,
        profitShareUser: 80,
        profitShareCompany: 20,
      },
    };

    await prisma.systemConfig.upsert({
      where: { key: 'RANK_CONFIGURATION' },
      update: {
        value: JSON.stringify(rankInfo),
        description: 'Rank system configuration based on current balance',
      },
      create: {
        key: 'RANK_CONFIGURATION',
        value: JSON.stringify(rankInfo),
        description: 'Rank system configuration based on current balance',
      },
    });

    console.log('✓ Rank configuration seeded successfully');

  } catch (error) {
    console.error('Error seeding level bonuses:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedLevelBonuses()
  .then(() => {
    console.log('Seeding completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  });
