/** Creates a Jam and a user */
import { PrismaClient } from "@prisma/client";
import { add } from "date-fns";

const prisma = new PrismaClient();

async function seed() {
  try {
    const task = await prisma.workerTask.create({
      data: {
        task_name: 'cleanup_exp_data',
        respawn: 30,
        data: "{}"
      }
    })

    console.log(`Task: ${task.id}`)
  } finally {
    await prisma.$disconnect();
  }
}

seed();
