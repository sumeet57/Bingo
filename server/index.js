import dotenv from "dotenv";
dotenv.config();

import http from "http";
import app from "./app.js";
import { connectDB } from "./config/Database.js";
import initSocket from "./sockets/index.js";
import redis from "./config/redis.js";

const PORT = process.env.PORT || 5000;

// DB connect
connectDB();

// Create HTTP server (not app.listen anymore)
const server = http.createServer(app);

// Bind Socket.io to server
initSocket(server);

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
