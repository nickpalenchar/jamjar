import { PrismaClient } from "@prisma/client";
import { Middleware, Context } from "../../middleware/types";
import httpErrors from "http-errors";
import { allowedFields } from "../../dbhelper/allowedFields";
import { getLogger } from "../../logging";
import { config } from "../../config";
const log = getLogger();

const prisma = new PrismaClient();

// POST /jam/:jamId/queue/:songId/vote
export const voteOnSong: Middleware = async (req, res, next) => {
  const { context }: { context: Context } = req.body;
  const { direction = "up" } = req.query;
  const { jamId, songId } = req.params;

  if (!context.principal.user) {
    return next(httpErrors.Unauthorized());
  }
  if (!(direction === "up" || direction === "down")) {
    return next(httpErrors.BadRequest('Direction must be "up" or "down".'));
  }

  const userInJam = await prisma.userInJam.findFirst({
    where: {
      jamId,
      userId: context.principal.user.id,
    },
  });

  if (!userInJam) {
    return next(httpErrors.Unauthorized("User is not part of this Jam."));
  }

  // TODO check the vibes.

  if (userInJam?.vibes < config.votingPrice) {
    return next(
      httpErrors.NotAcceptable(
        `Vibe check failed! Need ${config.votingPrice} vibes.`,
      ),
    );
  }

  const updatedQueueSong = await prisma.queueSongs.update({
    where: {
      jamId,
      id: songId,
    },
    data: {
      rank: {
        increment: 1,
      },
    },
  });

  if (!updatedQueueSong) {
    return next(httpErrors.NotFound("Could not find Song to update"));
  }
  await prisma.userInJam.update({
    where: { id: userInJam.id },
    data: {
      vibes: { decrement: 1 },
    },
  });

  res.status(201).send({
    userVibes: userInJam.vibes - 1,
    song: allowedFields("queueSongs", updatedQueueSong),
  });
};
