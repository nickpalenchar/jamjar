import { SpotifyClient } from "../../SpotifyClient";
import { Middleware } from "../../middleware/types";
import { spotifyProxyApi } from "../spotify";
import { PrismaClient } from "@prisma/client";
import httpErrors from "http-errors";
import querystring from "node:querystring";
const prisma = new PrismaClient();

export const startJam: Middleware = async (req, res, next) => {
  if (!req.body.principal.context.user.id) {
    return next(httpErrors.PreconditionRequired("Need a user id."));
  }
  const { id: userId } = req.body.principal.context.user;
  const { jamId } = req.params;
  const jam = await prisma.jam.findFirst({
    where: { id: jamId },
    include: {
      QueueSongs: true,
    },
  });
  if (!jam) {
    return next(httpErrors.NotFound("Jam not found"));
  }
  if (jam.userId !== userId) {
    return next(httpErrors.Forbidden("Non-owner cannot start this jam."));
  }
  if (!jam.QueueSongs.length) {
    return next(
      httpErrors.PreconditionRequired(
        "Need at least one song in the queue first",
      ),
    );
  }

  const spotifyClient = new SpotifyClient(req.body.context.principal.user);

  const playerQueue = await (
    await spotifyClient.fetch("/v1/me/player/queue", {})
  ).json();

  if (playerQueue.queue.length > 1) {
    return next(
      httpErrors.PreconditionFailed("Player Spotify queue must be cleared."),
    );
  }
  if (playerQueue.queue.length === 0) {
    const songToPlay = jam.QueueSongs[0];
    const params = querystring.encode({
      uri: songToPlay.spotifyUri,
    });
    await Promise.allSettled([
      spotifyClient.fetch(`/v1/me/player/queue?${params}`, {
        method: "post",
      }),
      prisma.queueSongs.delete({
        where: {
          id: jam.QueueSongs[0].id,
        },
      }),
    ]);
  }
  await spotifyClient.fetch("/v1/me/player/play", { method: "put" });
};

/**
 * check that:
 * - there is something in the songQueue
 * - but the player queue is empty.
 *
 * then:
 * - start the first song yourself,
 * - get the time of the song,
 *
 * - set a Task to enqueue the next song in time - 30 seconds.
 */
