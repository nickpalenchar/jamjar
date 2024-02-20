import { Middleware } from "../../middleware/types";
import { spotifyProxyApi } from "../spotify";


export const startJam: Middleware = async (req, res, next) => {

  
}

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