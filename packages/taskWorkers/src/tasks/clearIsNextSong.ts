/** Find the highest voted song for a jam and adds it to the playlist */
import { PrismaClient } from "@prisma/client";
import { getLoggerWithData } from "../logging";
import { add } from "date-fns";
import { SpotifyClient } from "@jamjar/util";

const prisma = new PrismaClient();

const log = getLoggerWithData({ taskName: "clear_isNext_song" });
interface ClearIsNextSongParams {
  jamId: string;
}

export const clearIsNextSong = async ({ jamId }: ClearIsNextSongParams) => {
  const now = new Date();

  console.log('trying')

  const { count } = await prisma.queueSongs.deleteMany({
    where: {
      jamId,
      isNext: true
    }
  });

  if (count > 1) {
    log.error('Deleted more than one isNext song within a single jam', { count, jamId })
  }
  else {
    log.info('Successfully cleaned up isNext song', { count, jamId })
  }
};
