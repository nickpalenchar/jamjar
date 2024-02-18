import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const devGetAdminUserByJamPhrase = async (phrase: string) => {
  if (!/[A-Za-z]+-[A-Za-z]+/.test(phrase)) {
    return null;
  }
  if (process.env.NODE_ENV !== "DEV") {
    return null;
  }
  const jam = await prisma.jam.findFirst({
    where: {
      phrase,
    },
  });
  if (!jam) {
    return null;
  }
  const user = await prisma.user.findFirst({
    where: {
      id: jam.userId,
    },
  });

  return {
    ...user,
    userInJam: jam,
  };
};
