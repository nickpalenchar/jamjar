import { prisma } from "@jamjar/database";
import { Context, Middleware } from "../../middleware/types";
import httpErrors from "http-errors";
import { allowedFields } from "../../dbhelper/allowedFields";

// POST /api/jam/:jamId/refreshOwnVibes
export const refreshOwnVibes: Middleware = async (req, res, next) => {
  const { context }: { context: Context } = req.body;
  const { jamId } = req.params;

  if (!context.principal.user) {
    return next(httpErrors.Unauthorized());
  }

  const jam = await prisma.jam.findFirstOrThrow({
    where: { id: jamId },
  });
  const userInJam = await prisma.userInJam.findFirstOrThrow({
    where: {
      userId: context.principal.user.id,
      jamId,
    },
  });

  // TODO check the user is part of the jam

  if (!jam) {
    return next(httpErrors.Gone("The jam is no longer active."));
  }

  const jamFields = allowedFields("jam", jam);

  const standings = jam.QueueSongs.sort((a, b) =>
    a.rank > b.rank ? -1 : 1,
  ).map((q) => allowedFields("queueSongs", q));

  res.status(200).send({
    ...jamFields,
    queue: standings,
  });
};
