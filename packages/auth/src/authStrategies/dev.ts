import { PrismaClient } from "@prisma/client";
import { add } from "date-fns";
import { AuthenticationResult } from "../middleware/types";

const prisma = new PrismaClient();

/**
 * devStrategy automatically authenticates as `admin@example.com`
 * for testing purposes. It is only available in the development environment.
 */
export const devStrategy = async (email = 'admin@example.com'): Promise<AuthenticationResult> => {
  if (process.env.NODE_ENV !== 'DEV') {
    return { success: false, reason: 'devStrategy is only available in development' }
  }
  let user = await prisma.user.findFirst({ where: {
    email,
  }});
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
    }
  });
  if (!session) {
    await prisma.session.create({
      data: {
        userId: user.id,
        exp: add(new Date(), { days: 30 }),
      }
    })
  }
  return { success: true, type: 'user', id: user.id };
}