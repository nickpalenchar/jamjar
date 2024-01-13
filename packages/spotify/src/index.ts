
export class SpotifyClient {
  name: string

  constructor(name: string) {
    this.name = name;
  }

  test() {
    return `hello, ${this.name}!`;
  }
}