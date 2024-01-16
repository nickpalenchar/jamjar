import { pathTemplate } from "./pathTemplate";

const a = pathTemplate("https://accounts.spotify.com");
const p = pathTemplate("https://api.spotify.com");

type SpotifyType = "album" | "artist" | "track" | "year" | "upc";

export class SpotifyClient {
  #clientId: string;
  #clientSecret: string;
  #clientCredentials: string | null;

  constructor(clientId: string, clientSecret: string) {
    console.log({ clientId, clientSecret });
    this.#clientId = clientId;
    this.#clientSecret = clientSecret;
    this.#clientCredentials = null;
  }

  protected async refreshClientCredentials() {
    const res = await fetch(a`/api/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic " +
          Buffer.from(`${this.#clientId}:${this.#clientSecret}`).toString(
            "base64",
          ),
      },
      body: "grant_type=client_credentials",
    });
    const body = await res.json();
    if (!body.access_token) {
      throw new Error(
        "Unexpected Spotify response from refreshing credentials",
      );
    }
    this.#clientCredentials = body.access_token;
  }

  protected async authFetch<T>(
    url: string,
    options: RequestInit = {},
    _isRetry: boolean = false,
  ): Promise<T> {
    if (!this.#clientCredentials) {
      await this.refreshClientCredentials();
    }
    const headers: RequestInit["headers"] = {
      ...options.headers,
      ...{ Authorization: `Bearer ${this.#clientCredentials}` },
    };
    const res = await fetch(url, { ...options, headers });

    if (res.status !== 200) {
      if (_isRetry) {
        const text = await res.text();
        throw new Error("Spotify Error: " + text);
      }
      await this.refreshClientCredentials();
      return this.authFetch(url, options, true);
    }

    return res.json() as Promise<T>;
  }

  async search(
    term: string,
    { type, limit }: { type: SpotifyType[]; limit: number } = {
      type: ["track"],
      limit: 10,
    },
  ) {
    const params = new URLSearchParams();
    params.append("q", term);
    params.append("type", type.join(","));
    params.append("limit", limit.toString());
    return this.authFetch(p`/v1/search?${params.toString()}`);
  }

  test() {
    return "OK";
  }
}
