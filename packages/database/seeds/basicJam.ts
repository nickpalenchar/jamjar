/** Creates a Jam and a user */
import { PrismaClient } from "@prisma/client";
import { add } from "date-fns";

const prisma = new PrismaClient();

async function seed() {
  try {
    const user = await prisma.user.create({
      data: {
        email: "admin@example.com",
        anon: false,
      },
    });
    const exp = new Date();
    exp.setDate(exp.getDate() + 40)
    const session = await prisma.session.create({
      data: {
        userId: user.id,
        exp
      }
    })
    const jam = await prisma.jam.create({
      data: {
        userId: user.id,
        spotify: {},
        phrase: 'hello-world',
        exp: add(Date.now(), { hours: 6 })
      },
    });
    console.log(`Jam: ${jam.phrase}`)
  } finally {
    await prisma.$disconnect();
  }
}

seed();
