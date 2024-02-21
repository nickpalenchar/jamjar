/** For use with spotify OAuth redirect
 * https://developer.spotify.com/documentation/web-api/tutorials/code-flow
 */

import { Middleware } from "../../middleware/types";
import { PrismaClient } from "@prisma/client";
import { isPast } from "date-fns";
import httpErrors from "http-errors";
import { config } from "../../config";
import { vault } from "../../vault/vault";

const prisma = new PrismaClient();

export const redirect: Middleware = async (req, res, next) => {
  const { state, code } = req.query;

  if (!code) {
    return next(httpErrors.Unauthorized());
  }
  if (!state) {
    return next(httpErrors.Unauthorized());
  }

  const spotifyState = await prisma.spotifyState.findFirst({
    where: {
      id: state.toString(),
    },
  });
  if (!spotifyState) {
    return next(httpErrors.Unauthorized());
  }
  if (isPast(spotifyState.exp)) {
    return next(
      httpErrors.RequestTimeout("Request has expired. Please try again"),
    );
  }

  const fetchOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " +
        Buffer.from(
          config.SPOTIFY_CLIENT_ID + ":" + config.SPOTIFY_CLIENT_SECRET,
        ).toString("base64"),
    },
    body: new URLSearchParams({
      code: code.toString(),
      redirect_uri: config.SPOTIFY_REDIRECT_URI,
      grant_type: "authorization_code",
    }),
  };

  const spotifyRes = await fetch(
    "https://accounts.spotify.com/api/token",
    fetchOptions,
  );
  if (!spotifyRes.ok) {
    return next(httpErrors.BadRequest("Bad response from Spotify."));
  }
  const spotifyBody = await spotifyRes.json();
  const { access_token, refresh_token } = spotifyBody;
  const sec_spotifyAccessToken = await vault.save(access_token, {});
  const sec_spotifyRefreshToken = await vault.save(refresh_token, {});
  await prisma.user.update({
    where: {
      id: spotifyState.userId,
    },
    data: {
      sec_spotifyAccessToken,
      sec_spotifyRefreshToken,
    },
  });
  res.redirect(`/jam/${spotifyState.jamId}`);
};
