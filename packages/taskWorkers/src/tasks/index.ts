import { cleanupExpData } from "./cleanupExpData";
import { selectNextWinner } from "./selectNextWinner";
import { clearIsNextSong } from "./clearIsNextSong";
import { playNextSongFromQueue } from "./playNextSongFromQueue";

export const tasks: Record<string, CallableFunction> = {
  cleanup_exp_data: cleanupExpData,
  select_next_winner: selectNextWinner,
  clear_isNext_song: clearIsNextSong,
  play_next_song_from_queue: playNextSongFromQueue,
};
