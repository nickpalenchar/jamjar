import { PrismaClient } from "@prisma/client";
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
  console.log(1);
  const now = new Date();
  const jam = await prisma.jam.findUnique({
    where: {
      id: jamId,
    },
    include: {
      QueueSongs: true,
    },
  });
  console.log(2);

  if (!jam) {
    throw Error("no jam");
  }
  const owner = await prisma.user.findUnique({
    where: {
      id: jam.userId,
    },
  });
  console.log(3);

  const spotifyClient = new SpotifyClient(owner);
  console.log({ QueueSongs: jam.QueueSongs });
  const nextSong = jam.QueueSongs.sort((a, b) => (a.rank < b.rank ? 1 : -1))[0];

  if (!nextSong) {
    log.info("no song in queue");
    // TODO pause
    return;
  }
  console.log(4);

  log.info("REQUESTING ", { uris: [jam.QueueSongs[0].spotifyUri] });
  const playReq = await spotifyClient.fetch("/v1/me/player/play", {
    method: "put",
    body: JSON.stringify({ uris: [jam.QueueSongs[0].spotifyUri] }),
    headers: {
      "Content-Type": "application/json",
    },
  });
  console.log(5);

  if (playReq.status === 404) {
    // TODO start playing again.
    log.error("Playback has stopped");
  }

  if (playReq.status !== 204) {
    log.error("Unhandled error", { status: playReq.status });
  }

  await prisma.queueSongs.delete({
    where: {
      id: nextSong.id,
    },
  });
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
