import { Context, Middleware } from "../../middleware/types";
import { PrismaClient } from "@prisma/client";
import httpErrors from "http-errors";
import { allowedFields } from "../../dbhelper/allowedFields";

const prisma = new PrismaClient();

export const joinJam: Middleware = async (req, res, next) => {
  const { jamId } = req.params;
  const { context }: { context: Context } = req.body;
  if (!req.body.context.principal.user) {
    return next(httpErrors.Unauthorized());
  }

  const userInJam = await prisma.userInJam.findFirst({
    where: {
      jamId,
      userId: context.principal.user?.id,
    },
  });

  if (userInJam) {
    return next(httpErrors.Conflict("User is already in Jam"));
  }

  const newUserInJam = await prisma.userInJam.create({
    data: {
      jamId,
      userId: context.principal.user?.id,
    },
  });

  res.status(201).json(allowedFields("userInJam", newUserInJam));
};
