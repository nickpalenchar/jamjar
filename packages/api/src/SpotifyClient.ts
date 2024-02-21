import { User } from "@prisma/client";
import { vault } from "./vault/vault";
import { getLogger, getLoggerWithData } from "./logging";
import { config } from "./config";
import path from "node:path";

const log = getLoggerWithData({ class: "SpotifyClient" });

export class SpotifyClient {
  #accessToken: Promise<string | null> | string | null;
  #refreshToken: Promise<string | null> | string | null;

  sec_spotifyAccessToken: string | null;
  sec_spotifyRefreshToken: string | null;

  constructor(user: User) {
    const { sec_spotifyAccessToken, sec_spotifyRefreshToken } = user!;

    this.sec_spotifyAccessToken = sec_spotifyAccessToken;
    this.sec_spotifyRefreshToken = sec_spotifyRefreshToken;
    this.#accessToken = vault.get(sec_spotifyAccessToken);
    this.#refreshToken = vault.get(sec_spotifyRefreshToken);
  }

  async fetch(
    route: string,
    options: RequestInit,
    _isRetry = false,
  ): ReturnType<typeof fetch> {
    this.#accessToken = (await this.#accessToken) as string;
    this.#refreshToken = (await this.#refreshToken) as string;
    const fetchUrl = new URL("https://api.spotify.com");
    fetchUrl.pathname = path.join(route);
    log.debug("Constructed fetch url", { url: fetchUrl.toString(), options });
    const res = await fetch(fetchUrl.toString(), {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${this.#accessToken}`,
      },
    });
    log.info("Response from spotify", { statusCode: res.status });
    if (
      res.status === 401 &&
      (await res.json())?.message === "The access token expired"
    ) {
      log.info("Refreshing the user token for spotify");
      if (_isRetry) {
        throw Error("Unauthorized - cannot refresh");
      }
      await this.refreshCredentials();
      return this.fetch(route, options, true);
    }
    return res;
  }
  async refreshCredentials() {
    if (!this.#refreshToken) {
      throw new Error("Need refresh but no token provided.");
    }
    log.info("Requesting refresh token grant from spotify");

    const refreshRes = await fetch("https://accounts.spotify.com/api/token", {
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(
          config.SPOTIFY_CLIENT_ID + ":" + config.SPOTIFY_CLIENT_SECRET,
        ).toString("base64")}`,
      },
      method: "POST",
      body: new URLSearchParams({
        refresh_token: (await this.#refreshToken) ?? "",
        grant_type: "refresh_token",
      }),
    });
    if (refreshRes.status !== 200) {
      return refreshRes;
    }
    log.info("New access token received");
    const { access_token, refresh_token } = await refreshRes.json();
    await vault.save(access_token, {
      id: this.sec_spotifyAccessToken ?? "dev-null",
      overwrite: true,
    });
    if (refresh_token) {
      await vault.save(refresh_token, {
        id: this.sec_spotifyRefreshToken ?? "dev-null",
        overwrite: true,
      });
    }
    this.#accessToken = access_token;
    this.#refreshToken = refresh_token;
  }
}
