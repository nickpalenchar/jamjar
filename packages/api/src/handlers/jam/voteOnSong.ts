import { PrismaClient } from "@prisma/client";
import { Middleware, Context } from "../../middleware/types";
import httpErrors from "http-errors";
import { allowedFields } from "../../dbhelper/allowedFields";
import { getLogger } from "../../logging";
import { config } from "../../config";
const log = getLogger();

const prisma = new PrismaClient();

// PUT /api/jam/:jamId/queue/:songId/vote
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
    log.warn("User is not part of this jam", {
      userId: context.principal.user.id,
      jamId,
    });
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

  const action = direction === "up" ? { increment: 1 } : { decrement: 1 };

  let updatedQueueSong;
  try {
    updatedQueueSong = await prisma.queueSongs.update({
      where: {
        jamId,
        id: songId,
      },
      data: {
        rank: action,
      },
    });
  } catch (e) {
    log.error("Error voting on song", {
      jamId,
      songId,
      userId: userInJam.userId,
      error: e,
    });
    return res.status(500).send("Error updating song vote");
  }

  if (!updatedQueueSong) {
    return next(httpErrors.NotFound("Could not find Song to update"));
  }
  if (updatedQueueSong.rank < 1) {
    await prisma.queueSongs.delete({
      where: {
        id: updatedQueueSong.id,
      },
    });
  }

  await prisma.userInJam.update({
    where: { id: userInJam.id },
    data: {
      vibes: { decrement: 1 },
    },
  });

  const updatedJam = await prisma.jam.findFirst({
    where: {
      id: jamId,
    },
    include: {
      QueueSongs: true,
    },
  });

  if (!updatedJam) {
    return next(httpErrors.NotFound("Cannot update song"));
  }

  const standings = updatedJam.QueueSongs.sort((a, b) =>
    a.rank > b.rank ? -1 : 1,
  ).map((q) => allowedFields("queueSongs", q));

  res.status(200).send({
    userVibes: userInJam.vibes - 1,
    song:
      updatedQueueSong.rank > 0
        ? allowedFields("queueSongs", updatedQueueSong)
        : null,
    updatedQueue: standings,
  });
};
