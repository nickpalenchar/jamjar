import { PrismaClient } from "@prisma/client";
import { Middleware, Context } from "../../middleware/types";
import httpErrors from "http-errors";
import { allowedFields } from "../../dbhelper/allowedFields";

const prisma = new PrismaClient();

// POST /jam/:jamId/queue/song
export const newQueueSong: Middleware = async (req, res, next) => {
  const { context }: { context: Context } = req.body;
  const { spotifyUri } = req.query;
  const { jamId } = req.params;

  if (!context.principal.user) {
    return next(httpErrors.Unauthorized());
  }
  if (!spotifyUri) {
    return next(httpErrors.BadRequest("Missing param spotifyUri"));
  }

  // TODO check the vibe

  // TODO check the spotify song

  const jam = await prisma.jam.findFirst({
    where: { id: jamId, exp: { gt: new Date() } },
  });

  if (!jam) {
    return next(httpErrors.Gone("The jam is no longer active."));
  }

  const queueSong = await prisma.queueSongs.create({
    data: {
      jamId: jam.id,
      userId: context.principal.user.id,
      name: "Test",
      artist: "Artist name",
      imageUrl: "#",
      spotifyUri,
    },
  });

  const updatedJam = await prisma.jam.update({
    where: {
      id: jam.id,
    },
    data: {
      QueueSongs: {
        connect: {
          id: queueSong.id,
        },
      },
    },
  });

  res.status(201).send(allowedFields("queueSongs", queueSong));

  // res.status(201).send(allowedFields("jam", jam));
};
