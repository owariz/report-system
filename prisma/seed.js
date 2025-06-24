const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log(`Start seeding ...`);

  const existingSuperAdmin = await prisma.account.findFirst({
    where: { role: 'SUPERADMIN' },
  });

  if (existingSuperAdmin) {
    console.log('Superadmin already exists.');
  } else {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password', salt);

    const superadmin = await prisma.account.create({
      data: {
        email: 'superadmin@example.com',
        username: 'superadmin',
        password: hashedPassword,
        role: 'SUPERADMIN',
        isVerified: true,
      },
    });
    console.log(`Created superadmin with id: ${superadmin.id}`);
  }

  console.log(`Seeding finished.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  }); 