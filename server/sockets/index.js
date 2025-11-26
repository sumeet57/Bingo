import { Server } from "socket.io";
import { socketConfig } from "../config/socket.js";
import { lobbyEvents } from "./lobby.handle.js";
// import registerLobbyHandlers from "./lobby.handler.js";
// import registerRoomHandlers from "./room.handler.js";
// import registerBingoGameHandlers from "./bingoGame.handler.js";

export default function initSocket(server) {
  const io = new Server(server, socketConfig);

  io.on("connection", (socket) => {
    console.log("🟢 Socket connected:", socket.id);

    lobbyEvents(io, socket);
    // registerLobbyHandlers(io, socket);
    // registerRoomHandlers(io, socket);
    // registerBingoGameHandlers(io, socket);

    socket.on("disconnect", () => {
      console.log("🔴 Socket disconnected:", socket.id);
    });
  });

  return io;
}
