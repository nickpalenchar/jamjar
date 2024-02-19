import { config } from "../../config";
import { Middleware, Context } from "../../middleware/types";
import { SpotifyClient } from "@jamjar/spotify";

const spotifyClient = new SpotifyClient(
  config.SPOTIFY_CLIENT_ID,
  config.SPOTIFY_CLIENT_SECRET,
);

// GET /api/spotify/search
export const search: Middleware = async (req, res) => {
  const searchQuery = req.query.q;
  if (!searchQuery) {
    return res.status(400).send("No search query.");
  }
  if (typeof searchQuery !== "string") {
    return res.status(400).send("Malformed query");
  }
  const resp = await spotifyClient.search(searchQuery);
  res.status(200).json(resp);
};

export * from "./authorize";
export * from "./spotifyProxyApi";
