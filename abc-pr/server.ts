// ABC Hospital PR System — backend entrypoint.
// All logic lives under ./src/server; this file just boots it so the existing
// scripts (npm run dev -> tsx server.ts) keep working unchanged.

// Must come before anything that reads process.env. Without it the app falls
// back to PostgreSQL's default port 5432 and refuses to start, because the
// local database listens on 5445 — which is only stated in `.env`. Relying on
// the shell to export those variables makes `npm run dev` fail on its own.
import "dotenv/config";

import { createApp, startServer } from "./src/server/app";

startServer(createApp());
