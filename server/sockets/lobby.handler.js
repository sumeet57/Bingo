import { getAllRooms } from "../store/rooms.js";

export default function registerLobbyHandlers(io, socket) {
  socket.on("lobby:get_rooms", (cb) => {
    const rooms = getAllRooms();
    if (typeof cb === "function") cb(rooms);
  });
}
