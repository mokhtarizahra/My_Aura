import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";

import authRoutes from "./routes/authRoutes.js";

const app = express();

/**
 * CORS
 *
 * The production frontend is served from the same origin as the API
 * (via reverse proxy / Next.js rewrites), so CORS is not strictly needed.
 * It is kept as a safety net for:
 *   - direct browser access to the API during development
 *   - non-browser clients that may consume the API in the future
 *
 * Only the configured CLIENT_URL origin is allowed.
 */
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

app.use(express.json());

/**
 * Cookie parser
 *
 * Enables req.cookies for cookie-based refresh-token transport.
 */
app.use(cookieParser());

/**
 * Authentication API
 */
app.use("/api/auth", authRoutes);

export default app;
