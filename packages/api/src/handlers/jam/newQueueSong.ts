import { PrismaClient } from "@prisma/client";
import { Middleware, Context } from "../../middleware/types";
import httpErrors from "http-errors";
import { allowedFields } from "../../dbhelper/allowedFields";
import { getLogger } from "@jamjar/util";
const log = getLogger();

const prisma = new PrismaClient();

// POST /api/jam/:jamId/queue/song
export const newQueueSong: Middleware = async (req, res, next) => {
  const {
    context,
    albumCoverUrl,
  }: { context: Context; albumCoverUrl: string; artist: string } = req.body;
  const { jamId } = req.params;
  const { spotifyUri, name, artist, imageUrl } = req.body;
  if (!context.principal.user) {
    return next(httpErrors.Unauthorized());
  }
  const REQUIRED_FILEDS = ["spotifyUri", "name", "artist", "imageUrl"];
  const missingFields = [];
  for (const field of REQUIRED_FILEDS) {
    if (!req.body[field]) {
      missingFields.push(field);
    }
  }
  if (missingFields.length) {
    return next(
      httpErrors.BadRequest(
        `Request needs properties: ${missingFields.join(",")}`,
      ),
    );
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
      name: name,
      artist: artist,
      imageUrl: imageUrl,
      spotifyUri: spotifyUri.toString(),
      ...(albumCoverUrl && { imageUrl: albumCoverUrl }),
    },
  });

  await prisma.jam.update({
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
};
