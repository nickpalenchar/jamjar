import { PrismaClient } from "@prisma/client";
import { Middleware } from "./types";
import httpErrors from "http-errors";

const prisma = new PrismaClient();

export const createJamOwnerContext: Middleware = async (req, res, next) => {
  const userId = req.body.context?.principal?.user?.id;
  if (!userId) {
    return next(httpErrors.Forbidden());
  }
  // jamId param not required, but narrows jams to just the one
  // specified in case there are multiple/old ones still in db.
  const { jamId } = req.query;
  const ownedJam = await prisma.jam.findFirst({
    where: {
      ...(jamId && { id: jamId.toString() }),
      userId,
    },
  });
  if (ownedJam) {
    req.body.context.ownedJamId = ownedJam.id;
    return next();
  }
  next(httpErrors.Forbidden());
};
