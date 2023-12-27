import { Middleware } from "./types";
import { PrismaClient } from "@prisma/client";
import { getLogger } from "../logging";
import { Logger } from "winston";

const prisma = new PrismaClient();
interface Context {
  log: Logger;
  principal: {
    user: Record<string, any> | null;
  };
}

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
