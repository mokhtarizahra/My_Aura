import dotenv from "dotenv";

dotenv.config();

import http from "http";
import { Server } from "socket.io";

import app from "./app.js";
import connectDB from "./config/db.js";
import { initSocket } from "./socket/socket.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    /**
     * Database
     */
    await connectDB();

    /**
     * HTTP Server
     */
    const server = http.createServer(app);

    /**
     * Socket.IO
     */
    const io = new Server(server, {
      cors: {
        origin: process.env.CLIENT_URL,
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

    initSocket(io);

    /**
     * Start listening
     */
    server.listen(PORT, () => {
      console.log(
        `🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`,
      );
    });
  } catch (error) {
    console.error(`❌ Server startup failed: ${error.message}`);

    process.exit(1);
  }
};

startServer();
