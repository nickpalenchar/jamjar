import { Middleware } from "../../middleware/types";
import httpErrors from "http-errors";
import { PrismaClient } from "@prisma/client";
import { getLogger } from "../../logging";
import { SpotifyClient } from "../../SpotifyClient";

const ALLOWED_ROUTES = ["/v1/me/player", "/v1/me/player/queue"];

const log = getLogger();

const prisma = new PrismaClient();

export const spotifyProxyApi: Middleware = async (req, res, next) => {
  const spotifyRoute = req.path.replace("/api/spotify/proxy-api", "");
  if (!ALLOWED_ROUTES.includes(spotifyRoute)) {
    return next(httpErrors.PreconditionFailed());
  }

  const spotifyClinet = new SpotifyClient(req.body.context.principal.user);

  const requestUri = `https://api.spotify.com${spotifyRoute}`;

  const sRes = await spotifyClinet.fetch(requestUri, { method: req.method });
  res.status(sRes.status).send(sRes.body);

  // log.info("Making spotify proxy request", { requestUri });
  // let spotifyRes;
  // try {
  //   spotifyRes = await spotifyRequest(
  //     context,
  //     requestUri,
  //     req.method as "get" | "post" | "put",
  //   );
  // } catch (e) {
  //   return next(httpErrors.Unauthorized());
  // }

  // if (!spotifyRes.ok) {
  //   log.error("Bad response from spotify proxy", {
  //     statusCode: spotifyRes.status,
  //     body: spotifyRes.statusText,
  //   });
  // }
};
