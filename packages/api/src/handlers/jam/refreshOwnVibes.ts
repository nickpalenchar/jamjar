import { PrismaClient } from "@prisma/client";
import { Context, Middleware } from "../../middleware/types";
import httpErrors from "http-errors";
import { allowedFields } from "../../dbhelper/allowedFields";

const prisma = new PrismaClient();

// POST /api/jam/:jamId/refreshOwnVibes
export const refreshOwnVibes: Middleware = async (req, res, next) => {
  const { context }: { context: Context } = req.body;
  const { jamId } = req.params;

  if (!context.principal.user) {
    return next(httpErrors.Unauthorized());
  }

  const jam = await prisma.jam.findFirst({
    where: { id: jamId },
  });
  if (!jam) {
    return res.status(400).send();
  }
  const userInJam = await prisma.userInJam.findFirst({
    where: {
      userId: context.principal.user.id,
      jamId,
    },
  });
  if (!userInJam) {
    return res.status(400).send();
  }

  const vibesToGrant = Math.floor(
    (Date.now() - userInJam.lastUpdate.getTime()) /
      (jam.VibeRefreshInterval * 1000),
  );

  if (vibesToGrant === 0) {
    return res.status(200).send({ updatedVibes: userInJam.vibes });
  }

  const updatedUserInJam = await prisma.userInJam.update({
    where: {
      id: userInJam.id,
    },
    data: {
      lastUpdate: new Date(),
      vibes: { increment: vibesToGrant },
    },
  });

  return res.status(200).send({ updatedVibes: updatedUserInJam.vibes });
};
