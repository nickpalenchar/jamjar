import { User } from "@prisma/client";
import { vault } from "./vault/vault";
import { getLogger } from "./logging";
import { config } from "./config";

const log = getLogger();

export class SpotifyClient {
  #accessToken: Promise<string | null> | string;
  #refreshToken: Promise<string | null> | string;

  sec_spotifyAccessToken: string;
  sec_spotifyRefreshToken: string;

  constructor(user: User) {
    const { sec_spotifyAccessToken, sec_spotifyRefreshToken } = user!;
    if (!sec_spotifyAccessToken) {
      throw new Error("No access token.");
    }
    if (!sec_spotifyRefreshToken) {
      throw new Error("No refresh token.");
    }
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

    const res = await fetch(`https://api.spotify.com${route}`, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${this.#accessToken}`,
      },
    });
    if (
      res.status === 401 &&
      (await res.json())?.message === "The access token expired"
    ) {
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
      id: this.sec_spotifyAccessToken,
      overwrite: true,
    });
    if (refresh_token) {
      await vault.save(refresh_token, {
        id: this.sec_spotifyRefreshToken,
        overwrite: true,
      });
    }
    this.#accessToken = access_token;
    this.#refreshToken = refresh_token;
  }
}
