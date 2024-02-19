import { Router } from "express";
import { search, authorize, spotifyProxyApi } from "../handlers/spotify";
import { redirect } from "../handlers/spotify/redirect";

export const spotify = Router();

spotify.get("/search", search);

spotify.get("/authorize", authorize);
spotify.get("/redirect", redirect);

// api proxy to spotify
spotify.use("/proxy-api", spotifyProxyApi);
