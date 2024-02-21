/** Find the highest voted song for a jam and adds it to the playlist */
import { PrismaClient } from "@prisma/client";
import { getLoggerWithData } from "../logging";
import { isBefore } from "date-fns";
import { SpotifyClient } from '../../../api/src/spotifyClient';

const prisma = new PrismaClient();

const log = getLoggerWithData({ taskName: 'select_next_winner' });
interface SelectNextWinnerParams {
  jamId: string;
}

export const cleanupExpData = async ({ jamId }: SelectNextWinnerParams) => {
  const now = new Date();
  const jam = await prisma.jam.findUnique({
    where: {
      id: jamId,
    },
    include: {
      QueueSongs: true,
    }
  });
  if (!jam) {
    log.error('Jam does not exist.');
    return;
  }

  const owner = await prisma.user.findUnique({
    where: {
      id: jam.userId,
    }
  });

  const spotifyClient = new SpotifyClient

  const { count } = await prisma.user.deleteMany({
    where: {
      anon: true,
      exp: { lt: now },
    },
  });
  log.info('Deleted expired user records', { count });
}