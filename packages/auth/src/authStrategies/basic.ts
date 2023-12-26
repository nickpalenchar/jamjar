import { PrismaClient } from "@prisma/client";
import { isPast } from "date-fns";
import { AuthenticationResult } from "../middleware/types";

const prisma = new PrismaClient();

/**
 * basicAuthStrategy takes a session based on the 'Authorization'
 * header and matches it to a user. Sessions which don't have
 * a user or expired sessions throw an error, indicating unauthorized.
 */
export const basicAuthStrategy = async (
  authKey: string,
): Promise<AuthenticationResult> => {
  const session = await prisma.session.findFirst({
    where: {
      id: authKey,
    },
  });
  if (!session) {
    return { success: false, reason: "Authentication failed." };
  }
  if (isPast(session.exp)) {
    return { success: false, reason: "Session expired." };
  }
  const user = await prisma.user.findFirst({
    where: {
      id: session.userId,
    },
  });
  if (!user) {
    return { success: false, reason: "Authentication failed." };
  }
  return { success: true, type: "user", id: user.id };
};
