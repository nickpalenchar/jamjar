/** Creates a Jam and a user */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seed() {
  try {
    const user = await prisma.user.create({
      data: {
        email: "admin@example.com",
        anon: false,
      },
    });
    console.log('Users:')
    console.log(user);
    const jam = await prisma.jam.create({
      data: {
        userId: user.id,
        spotify: {},
      },
    });
    console.log('\nJam:')
  } finally {
    await prisma.$disconnect();
  }
}

seed();
