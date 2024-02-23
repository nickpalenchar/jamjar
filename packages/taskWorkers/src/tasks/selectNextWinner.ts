/** Find the highest voted song for a jam and adds it to the playlist */
import { PrismaClient } from "@prisma/client";
import { getLoggerWithData } from "../logging";
import { add } from "date-fns";
import { SpotifyClient } from "@jamjar/util";

const prisma = new PrismaClient();

const log = getLoggerWithData({ taskName: "select_next_winner" });
interface SelectNextWinnerParams {
  jamId: string;
}

export const selectNextWinner = async ({ jamId }: SelectNextWinnerParams) => {
  const now = new Date();
  const jam = await prisma.jam.findUnique({
    where: {
      id: jamId,
    },
    include: {
      QueueSongs: true,
    },
  });
  if (!jam) {
    log.error("Jam does not exist.");
    return;
  }

  const owner = await prisma.user.findUnique({
    where: {
      id: jam.userId,
    },
  });

  const nextSong = jam.QueueSongs.sort((a, b) => (a.rank < b.rank ? 1 : -1))[0];

  const spotifyClient = new SpotifyClient(owner);

  log.info("Requesting to add to playlist", {
    playlistId: jam.spotifyPlaylistId,
    uri: nextSong.spotifyUri,
  });
  const addSongRes = await spotifyClient.fetch(
    `/v1/playlists/${jam.spotifyPlaylistId}/tracks`,
    {
      method: "post",
      body: JSON.stringify({
        uris: [nextSong.spotifyUri],
      }),
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
  if (!addSongRes.ok) {
    console.error("Could not add the song", { status: addSongRes.status });
    return;
  }
  const addToQueueRes = await spotifyClient.fetch("/v1/me/player/queue", {
    method: "post",
    body: JSON.stringify({
      uri: nextSong.spotifyUri,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  // mark the added song as will play next
  await prisma.queueSongs.update({
    where: {
      id: nextSong.id,
    },
    data: {
      isNext: true,
    },
  });

  const currentlyPlaying = await (
    await spotifyClient.fetch("/v1/me/player/currently-playing", {})
  ).json();

  const timeLeft = Math.round(
    (currentlyPlaying.item.duration_ms - currentlyPlaying.progress_ms) / 1000,
  );

  log.info("Scheduled cleanup isNext", {
    inSeconds: timeLeft,
    jamId,
    userId: jam.userId,
  });

  await prisma.workerTask.create({
    data: {
      task_name: "clear_isNext_song",
      not_before: add(new Date(), { seconds: timeLeft }),
      data: {
        jamId,
      },
    },
  });
};
