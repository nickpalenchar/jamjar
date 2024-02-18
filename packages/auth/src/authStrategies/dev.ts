import { PrismaClient } from "@prisma/client";
import { add } from "date-fns";
import { AuthenticationResult } from "../middleware/types";

const prisma = new PrismaClient();

/** devJamAdminStrategy automatically authenticates as a user who owns a Jam
 *  based on the cookie value. If the Jam doesn't exist, it's created.
 * 
 *  COOKIE: asAdminOfJam=hello-world
 */
export const devJamAdminStrategy = async (phrase: string): Promise<AuthenticationResult> => {
  if (process.env.NODE_ENV !== "DEV") {
    return {
      success: false,
      reason: "devJamAdminStrategy is only available in development",
    };
  }
  if (!/[A-Za-z]+-[A-Za-z]+/.test(phrase)) {
    return { success: false, reason: "malformed phrase"}
  }
  let user;
  let jam = await prisma.jam.findFirst({where: { phrase }});
  if (!jam) {
    user = await prisma.user.create({ data: {
      email: `admin+${phrase}@example.com`,
      anon: false,
      exp: add(new Date(), { hours: 24 })
    }});
    jam = await prisma.jam.create({
      data: {
        userId: user.id,
        phrase,
        spotify: {},
        exp: add(new Date(), { hours: 24 }),
      }
    })
  } else {
    user = await prisma.user.findFirstOrThrow({
      where: {
        id: jam.userId
      }
    })
  }
  return { success: true, type: "user", id: user.id }
}
/**
 * devStrategy automatically authenticates as `admin@example.com`
 * for testing purposes. It is only available in the development environment.
 */
export const devStrategy = async (
  email = "admin@example.com",
): Promise<AuthenticationResult> => {
  if (process.env.NODE_ENV !== "DEV") {
    return {
      success: false,
      reason: "devStrategy is only available in development",
    };
  }
  let user = await prisma.user.findFirst({
    where: {
      email,
    },
  });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        anon: false,
      },
    });
  }
  const session = await prisma.session.findFirst({
    where: {
      userId: user.id,
    },
  });
  if (!session) {
    await prisma.session.create({
      data: {
        userId: user.id,
        exp: add(new Date(), { days: 30 }),
      },
    });
  }
  return { success: true, type: "user", id: user.id };
};
