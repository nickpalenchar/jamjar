import { SpotifyClient } from "../../spotifyClient";
import { Context, Middleware } from "../../middleware/types";
import { spotifyProxyApi } from "../spotify";
import { PrismaClient } from "@prisma/client";
import httpErrors from "http-errors";
import querystring from "node:querystring";
const prisma = new PrismaClient();

/** POST /api/jam/:jamId/start */
export const startJam: Middleware = async (req, res, next) => {
  console.log("req!", req.body);
  const { context }: { context: Context } = req.body;
  if (!context.principal.user?.id) {
    return next(httpErrors.PreconditionRequired("Need a user id."));
  }
  const { id: userId } = context.principal.user;
  const { jamId } = req.params;
  const jam = await prisma.jam.findFirst({
    where: { id: jamId },
    include: {
      QueueSongs: true,
    },
  });
  context.log.info("checks that the jam can play");
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
  console.info("pre-checks for jam successful.");
  const spotifyClient = new SpotifyClient(req.body.context.principal.user);

  const playerQueue = await (
    await spotifyClient.fetch("/v1/me/player/queue", {})
  ).json();

  context.log.info("Current player queue", {
    currentlyPlaying: !!playerQueue.currently_playing,
    queueLength: playerQueue.queue.length,
  });
  if (playerQueue.queue.length > 1) {
    return next(
      httpErrors.PreconditionFailed("Player Spotify queue must be cleared."),
    );
  }
  context.log.info("getting the user");
  const spotifyUserIdReq = await spotifyClient.fetch("/v1/me", {});
  if (!spotifyUserIdReq.ok) {
    return next(
      httpErrors.PreconditionRequired(
        "Could not get spotify info. Try re-authenticating.",
      ),
    );
  }
  const spotifyUserId = (await spotifyUserIdReq.json()).id;

  if (playerQueue.queue.length === 0) {
    const songToPlay = jam.QueueSongs[0];
    const params = querystring.encode({
      uri: songToPlay.spotifyUri,
    });
    context.log.info("Adding song to queue", { songToPlay: songToPlay.name });
    const [spotifyAdd] = await Promise.allSettled([
      spotifyClient.fetch(`/v1/users/queue?${params}`, {
        method: "post",
      }),
      prisma.queueSongs.delete({
        where: {
          id: jam.QueueSongs[0].id,
        },
      }),
    ]);

    console.log("success", { addToQueueStates: spotifyAdd.status });
  }
  const playSpotify = await spotifyClient.fetch("/v1/me/player/play", {
    method: "put",
  });
  if (!playSpotify.ok) {
    const error = await playSpotify.json();
    console.error("Could not play spotify", error);
  }
  return res.status(201).send();
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
