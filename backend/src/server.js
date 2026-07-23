import dotenv from "dotenv";
// Load environment variables
dotenv.config();

import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import connectDB from "./config/db.js";
import { initSocket } from "./socket/socket.js";
import profileRoutes from "./routes/profileRoutes.js";
import userRouters from "./routes/userRoutes.js";
import matchRoutes from "./routes/matchRoutes.js";
import accountRoutes from "./routes/accountRoutes.js";
import chatRoutes  from "./routes/chatRoutes.js";
import conversationRoutes from "./routes/conversationRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";

import authRoutes from "./routes/authRoutes.js";

const app = express();
const server = http.createServer(app);

// Connect to Database
connectDB();

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"],
    credentials: true
  }
});

initSocket(io);

// Middlewares
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true
  })
);
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/users", userRouters);
app.use("/api/match", matchRoutes);
app.use("/api/account", accountRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
