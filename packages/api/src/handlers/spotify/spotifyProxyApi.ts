import { Context, Middleware } from "../../middleware/types";
import httpErrors from "http-errors";
import { PrismaClient } from "@prisma/client";
import { getLogger } from "../../logging";
import { SpotifyClient } from "../../SpotifyClient";

const ALLOWED_ROUTES = ["/v1/me/player", "/v1/me/player/queue"];

const log = getLogger();

const prisma = new PrismaClient();

export const spotifyProxyApi: Middleware = async (req, res, next) => {
  const spotifyRoute = req.path.replace("/api/spotify/proxy-api", "");
  const { context }: { context: Context } = req.body;
  if (!ALLOWED_ROUTES.includes(spotifyRoute)) {
    context.log.error("Spotify route not allowed");
    return next(httpErrors.PreconditionFailed());
  }

  const spotifyClinet = new SpotifyClient(req.body.context.principal.user);

  // const requestUri = `https://api.spotify.com${spotifyRoute}`;

  const sRes = await spotifyClinet.fetch(spotifyRoute, { method: req.method });
  res.status(sRes.status).send(sRes.body);
};
