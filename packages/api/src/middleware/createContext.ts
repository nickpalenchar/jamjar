import { Middleware, Context } from "./types";
import { PrismaClient } from "@prisma/client";
import { getLogger } from "../logging";
const prisma = new PrismaClient();

const getUserFromUserContext = async (
  userContext?: string,
): Promise<Record<string, any> | null> => {
  if (!userContext) {
    return null;
  }
  const user = await prisma.user.findFirst({
    where: {
      id: userContext,
    },
    include: { Jam: true },
  });
  return user;
};

export const createContext: Middleware = async (req, res, next) => {
  const sessionId = req.headers["user-context"]?.toString();
  const context: Context = {
    log: getLogger(),
    principal: {
      user: await getUserFromUserContext(sessionId),
    },
  };
  req.body.context = context;
  next();
};
