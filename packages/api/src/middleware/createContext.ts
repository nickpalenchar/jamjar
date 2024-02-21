import { Middleware, Context } from "./types";
import { PrismaClient } from "@prisma/client";
import { getLogger, getLoggerWithData } from "@jamjar/util";
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
  const user = await getUserFromUserContext(sessionId);
  const loggingData = { route: req.route, userId: user?.id ?? null };

  const context: Context = {
    log: getLoggerWithData(loggingData) as Context["log"],
    principal: {
      user,
    },
  };
  req.body.context = context;
  next();
};
