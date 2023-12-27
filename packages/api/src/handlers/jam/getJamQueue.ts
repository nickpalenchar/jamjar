import { PrismaClient } from "@prisma/client";
import { Middleware, Context } from "../../middleware/types";
import httpErrors from "http-errors";
import { allowedFields } from "../../dbhelper/allowedFields";

const prisma = new PrismaClient();

// POST /jam/:jamId/queue/song
export const getJamQueue: Middleware = async (req, res, next) => {
  const { context }: { context: Context } = req.body;
  const { jamId } = req.params;

  if (!context.principal.user) {
    return next(httpErrors.Unauthorized());
  }

  // TODO check the user is part of the jam

  const jam = await prisma.jam.findFirst({
    where: { id: jamId, exp: { gt: new Date() } },
    include: { QueueSongs: true },
  });

  if (!jam) {
    return next(httpErrors.Gone("The jam is no longer active."));
  }

  const standings = jam.QueueSongs.sort((a, b) =>
    a.rank > b.rank ? 1 : -1,
  ).map((q) => allowedFields("queueSongs", q));

  res.status(201).send(standings);
};
