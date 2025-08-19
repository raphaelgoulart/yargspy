<h1>YARGLB</h1>

**Description:**  
Unofficial leaderboard API server for YARG using NodeJS and MongoDB, with REPLAY file validation program written in C#.

# Developing

## Client and Server

Both client and server uses TypeScript:

- `frontend`: Using React.
  - _The client is only being used for debugging process at the moment_.
- `backend`: Using NodeJS and Fastify framework

On both client and server:

```bat
pnpm install
pnpm run dev
```

## YARGReplayValidator

Written in C#, the tool is used by the server and uses the YARG Core itself to validate score files (REPLAY files).

## YARGReplayWatcher

Writen in Python, the script acts as a YARG REPLAYs folder watcher, trying to make the automatic upload of the entry for the logged user.

# Documentation

- [Server API Documentation](docs/serverapi.md)
