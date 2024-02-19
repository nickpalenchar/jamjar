import { Context, Middleware } from "../../middleware/types";
import httpErrors from "http-errors";
import { PrismaClient } from "@prisma/client";
import { vault } from "../../vault/vault";
import { getLogger } from "../../logging";
import { config } from "../../config";

const ALLOWED_ROUTES = ["/v1/me/player"];

const log = getLogger();

const prisma = new PrismaClient();

const spotifyRequest = async (
  context: Context,
  route: string,
  method: "get" | "put" | "post",
  body?: Record<string, any>,
) => {
  const { sec_spotifyAccessToken, sec_spotifyRefreshToken } =
    context.principal.user!;
  const accessToken = await vault.get(sec_spotifyAccessToken);
  if (!accessToken) {
    log.error("Access Token does not exist");
    throw new Error("Access Token does not exist.");
  }

  const spotifyRes = await fetch(route, {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (spotifyRes.ok) {
    return spotifyRes;
  }

  if (
    true ||
    (spotifyRes.status === 401 &&
      (await spotifyRes.json())?.message === "The access token expired")
  ) {
    // Refresh flow https://developer.spotify.com/documentation/web-api/tutorials/refreshing-tokens
    log.info("Requesting refresh token grant from spotify");
    const refreshToken = await vault.get(sec_spotifyAccessToken);
    if (!refreshToken) {
      throw new Error("No refresh token exists");
    }
    const refreshRes = await fetch("https://api.spotify.com/api/token", {
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(
          config.SPOTIFY_CLIENT_ID + ":" + config.SPOTIFY_CLIENT_SECRET,
        ).toString("base64")}`,
      },
      method: "POST",
      body: new URLSearchParams({
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    });
    if (refreshRes.status !== 200) {
      console.log("EEEEE", await refreshRes.json());
      return refreshRes;
    }
    log.info("New access token received");
    const { access_token, refresh_token } = await refreshRes.json();
    await vault.save(access_token, {
      id: sec_spotifyAccessToken,
      overwrite: true,
    });
    if (refresh_token) {
      await vault.save(refresh_token, {
        id: sec_spotifyRefreshToken,
        overwrite: true,
      });
    }
    const retryRes = await fetch(route, {
      method,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!retryRes.ok) {
      log.error("Still got error after successful token refresh", {
        userId: context.principal.user?.id ?? null,
        route,
      });
    }
    return retryRes;
  }
  // an error that isn't a refresh token problem
  return spotifyRes;
};

export const spotifyProxyApi: Middleware = async (req, res, next) => {
  const { context }: { context: Context } = req.body;
  const spotifyRoute = req.path.replace("/api/spotify/proxy-api", "");
  if (!ALLOWED_ROUTES.includes(spotifyRoute)) {
    return next(httpErrors.PreconditionFailed());
  }

  const { sec_spotifyAccessToken, sec_spotifyRefreshToken } =
    context.principal.user!;

  const requestUri = `https://api.spotify.com${spotifyRoute}`;
  log.info("Making spotify proxy request", { requestUri });
  const spotifyRes = await spotifyRequest(
    context,
    requestUri,
    req.method as "get" | "post" | "put",
  );

  if (!spotifyRes.ok) {
    log.error("Bad response from spotify proxy", {
      statusCode: spotifyRes.status,
      body: spotifyRes.statusText,
    });
  }

  res.status(spotifyRes.status).send(spotifyRes.body);
};
