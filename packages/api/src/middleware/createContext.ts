import { Middleware } from "./types";
import { prisma } from "@jamjar/database";
import { getLogger } from "../logging";
import { Logger } from "winston";

interface Context {
  log: Logger;
  principal: {
    user: Record<string, any> | null;
  };
}

const getUserFromSessionId = async (
  sessionId?: string,
): Promise<Record<string, any> | null> => {
  if (!sessionId) {
    return null;
  }

  const session = await prisma.session.findFirst({
    where: {
      id: sessionId,
    },
  });
  if (!session) {
    return null;
  }
  const user = await prisma.user.findFirst({
    where: {
      id: session.userId,
    },
  });
  return user;
};

export const createContext: Middleware = async (req, res, next) => {
  const sessionId = req.headers["authorization"]?.split(" ")?.[1];
  const context: Context = {
    log: getLogger(),
    principal: {
      user: await getUserFromSessionId(sessionId),
    },
  };
  req.body.context = context;
  next();
};
