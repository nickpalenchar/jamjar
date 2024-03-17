import { PrismaClient, QueueSongs } from "@prisma/client";
import { getLoggerWithData } from "../logging";
import { add, isBefore } from "date-fns";
import { SpotifyClient } from "@jamjar/util";

const prisma = new PrismaClient();

const log = getLoggerWithData({ taskName: "play_next_song_from_queue" });

interface PlayNextSongFromQueueParams {
  jamId: string;
}

export const playNextSongFromQueue = async ({
  jamId,
}: PlayNextSongFromQueueParams) => {
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
    throw Error("no jam");
  }
  const owner = await prisma.user.findUnique({
    where: {
      id: jam.userId,
    },
  });

  const spotifyClient = new SpotifyClient(owner);
  console.log({ QueueSongs: jam.QueueSongs });

  let lastNowPlaying: QueueSongs | undefined;
  const songsRanked = jam.QueueSongs.filter((song) => {
    if (song.nowPlaying) {
      lastNowPlaying = song;
      return false;
    }
    return true;
  }).sort((a, b) => (a.rank < b.rank ? 1 : -1));

  const nextSong = songsRanked[0];

  if (!nextSong) {
    log.info("no song in queue");
    // TODO pause
    return;
  }

  log.info("REQUESTING ", { uris: [nextSong.spotifyUri] });
  const playReq = await spotifyClient.fetch("/v1/me/player/play", {
    method: "put",
    body: JSON.stringify({ uris: [nextSong.spotifyUri] }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (playReq.status === 404) {
    // TODO start playing again.
    log.error("Playback has stopped");
  }

  if (playReq.status !== 204) {
    log.error("Unhandled error", { status: playReq.status });
  }

  if (playReq.status < 300) {
    await prisma.queueSongs.update({
      where: {
        id: nextSong.id,
      },
      data: {
        nowPlaying: true,
      },
    });
  }

  if (lastNowPlaying) {
    await prisma.queueSongs.delete({
      where: {
        id: lastNowPlaying.id,
      },
    });
  }
  log.info("fetching id", {
    route: `/v1/tracks/${nextSong.spotifyUri?.split(":").at(-1)}`,
  });
  const newSongInfoReq = await spotifyClient.fetch(
    `/v1/tracks/${nextSong.spotifyUri?.split(":").at(-1)}`,
    {},
  );
  const data = await newSongInfoReq.json();
  const nextSongSecs = Math.floor(data.duration_ms - 2000) / 1000;

  log.info("Will play next song in", { seconds: nextSongSecs });
  await prisma.workerTask.create({
    data: {
      task_name: "play_next_song_from_queue",
      data: { jamId },
      not_before: add(new Date(), { seconds: nextSongSecs }),
    },
  });
};
