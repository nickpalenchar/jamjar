import { config } from "@jamjar/util";
import { Middleware, Context } from "../../middleware/types";
import { SpotifyClient } from "@jamjar/spotify";

const spotifyClient = new SpotifyClient(
  config.SPOTIFY_CLIENT_ID,
  config.SPOTIFY_CLIENT_SECRET,
);
// GET /health
export const getHealth: Middleware = async (req, res) => {
  const resp = await spotifyClient.search("hello");
  res.status(200).json(resp);
};
