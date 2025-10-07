<h1>YARGSpy</h1>

**Description:**  
Unofficial leaderboard API server for YARG using NodeJS and MongoDB, with REPLAY file validation program written in C#.

# Developing

## Client and Server

Both client and server uses TypeScript:

- `frontend`: Using Vue 3.
- `backend`: Using NodeJS and Fastify framework

On both client and server:

```bat
pnpm install
pnpm run dev
```

## YARGReplayValidator

Written in C#, the tool is used by the server and uses the YARG Core itself to validate score files (REPLAY files).

# Documentation

- [Server API Documentation](docs/serverapi.md)
