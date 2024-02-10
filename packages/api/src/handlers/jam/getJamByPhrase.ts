import { PrismaClient } from "@prisma/client";
import { Middleware, Context } from "../../middleware/types";
import httpErrors from "http-errors";
import { getLogger } from "../../logging";
const log = getLogger();

const prisma = new PrismaClient();

// GET /api/jam/phrase/:phrase/
export const getJamByPhrase: Middleware = async (req, res, next) => {
  const { context }: { context: Context } = req.body;
  const { phrase } = req.params;

  log.error({ phrase });
  if (!context.principal.user) {
    return next(httpErrors.Unauthorized());
  }

  const jam = await prisma.jam.findFirst({
    where: { phrase, exp: { gt: new Date() } },
    include: { QueueSongs: false },
  });

  if (!jam) {
    return next(httpErrors.Gone("The jam is no longer active."));
  }

  res.status(201).json({
    jamId: jam.id,
  });
};
