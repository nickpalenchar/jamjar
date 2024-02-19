import { Middleware } from "../../middleware/types";
import { PrismaClient } from "@prisma/client";
import httpErrors from "http-errors";
import { add } from "date-fns";
import querystring from "querystring";
import { config } from "../../config";
const prisma = new PrismaClient();

// GET /api/spotify/authorize
export const authorize: Middleware = async (req, res, next) => {
  const { jamId } = req.query;
  // generate state and save in
  if (!jamId) {
    return next(httpErrors.BadRequest("Missing JamId"));
  }
  if (!req.body.context.principal.user) {
    return next(httpErrors.Unauthorized());
  }
  const state = await prisma.spotifyState.create({
    data: {
      exp: add(new Date(), { minutes: 10 }),
      userId: req.body.context.principal.user.id,
      jamId: jamId?.toString(),
    },
  });

  res.redirect(
    "https://accounts.spotify.com/authorize?" +
      querystring.stringify({
        response_type: "code",
        client_id: config.SPOTIFY_CLIENT_ID,
        scope: ["user-read-playback-state", "user-modify-playback-state"].join(
          " ",
        ),
        state: state.id,
        redirect_uri: config.SPOTIFY_REDIRECT_URI,
      }),
  );
};
