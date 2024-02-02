# jamjar
croud-sourced playlists

# Getting Started

Easiest way is currently:

```shell
./scripts/initialize-environment.sh
npm run -w @jamjar/database seed:basicJam
```

This creates an active Jam with phrase `basic-test`

Then run the fill stack with
```
npm run dev
```