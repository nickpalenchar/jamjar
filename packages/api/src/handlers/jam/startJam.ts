import { SpotifyClient } from "@jamjar/util";
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

  /// todo maybe remove this
  // if (playerQueue.queue.length === 0) {
  //   const songToPlay = jam.QueueSongs[0];
  //   const params = querystring.encode({
  //     uri: songToPlay.spotifyUri,
  //   });
  //   context.log.info("Adding song to queue", { songToPlay: songToPlay.name });
  // }

  //TODO check if playlist exists
  if (jam.spotifyPlaylistId) {
    // todo play the playlist
    // check if its playing
    const playbackReq = await spotifyClient.fetch("/v1/me/player", {});
    console.log(">>> status >>1, ", playbackReq.status);
    if (playbackReq.status === 204) {
      return next(
        httpErrors.PreconditionFailed(
          "You're close... but you need to start the playlist yourself.",
        ),
      );
    }
    const data = await playbackReq.json();
    if (!data.is_playing) {
      return next(
        httpErrors.PreconditionFailed(
          "You're close... but you need to start the playlist yourself.",
        ),
      );
    }
    /** SelectNextWinner playlistUri, jamId */
    await prisma.workerTask.create({
      data: {
        task_name: "select_next_winner",
        data: {
          jamId,
        },
      },
    });
    return res.status(201).send(data);
  }
  // need new playlist first
  const newPlaylistReq = await spotifyClient.fetch(
    `/v1/users/${spotifyUserId}/playlists`,
    {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "Jive " + jam.phrase,
      }),
    },
  );
  if (!newPlaylistReq.ok) {
    return next(
      httpErrors.PreconditionFailed(
        "Could not create playlist. Try re-authenticating spotify",
      ),
    );
  }
  const { id: playlistId, name: playlistName } = await newPlaylistReq.json();
  context.log.info("Created new playlist", { playlistId, playlistName });
  // TODO save id on Jam
  console.log("success", { addToQueueStates: newPlaylistReq.status });

  await prisma.jam.update({
    where: {
      id: jam.id,
    },
    data: {
      spotifyPlaylistId: playlistId,
    },
  });

  const trackAddRequest = await spotifyClient.fetch(
    `/v1/playlists/${playlistId}/tracks`,
    {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        uris: [jam.QueueSongs[0].spotifyUri],
      }),
    },
  );
  context.log.info("Added first track to playlist");

  return res.status(206).json({ data: { playlist: playlistName } });

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
