<h1>YARGLB</h1>

**Description:**  
Unofficial leaderboard API server for YARG using NodeJS and MongoDB, with REPLAY file validation program written in C#.

# Installing/Developing

This repository contains two JavaScript projects:

- `yarglb-frontend`: Using React.
  - _The frontend is only being used for debugging process at the moment_.
- `yarglb-backend`: Using NodeJS + Fastify framework

On both frontend and backend:

```bat
pnpm install
pnpm run dev
```

It also includes YARGReplayValidator, a CLI tool written in C# to validate REPLAY files to be registered.

# Documentation

- [Server API Documentation](docs/serverapi.md)
