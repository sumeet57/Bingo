import {
  createRoom,
  getRoom,
  hasRoom,
  assignTicketIndex,
  releaseTicketIndex,
  deleteRoom,
} from "../store/rooms.js";
import {
  initRoomPlayers,
  addPlayer,
  getPlayer,
  getPlayersInRoom,
  removePlayer,
  clearRoomPlayers,
} from "../store/players.js";
import {
  initRoomSocketMap,
  addSocket,
  removeSocket,
  clearRoomSockets,
} from "../store/sockets.js";

function cleanupRoom(io, roomId) {
  clearRoomPlayers(roomId);
  clearRoomSockets(roomId);
  deleteRoom(roomId);
  io.in(roomId).socketsLeave(roomId);
}

export default function registerRoomHandlers(io, socket) {
  socket.on("room:create", (payload, cb) => {
    const { roomId, winnerLimit, hostUserId, hostName } = payload || {};
    console.log("room:create payload:", payload);
    if (!roomId || !hostUserId) {
      if (typeof cb === "function")
        cb({ ok: false, error: "roomId and hostUserId required" });
      return;
    }
    if (hasRoom(roomId)) {
      if (typeof cb === "function")
        cb({ ok: false, error: "room already exists" });
      return;
    }
    const room = createRoom(roomId, { winnerLimit });
    initRoomPlayers(roomId);
    initRoomSocketMap(roomId);

    const ticketIndex = assignTicketIndex(roomId);
    addPlayer(roomId, hostUserId, {
      name: hostName, // <-- keep actual user name
      role: "host", // <-- add HOST ROLE
      claims: 0,
      ticket: ticketIndex,
    });

    addSocket(roomId, socket.id, hostUserId);
    socket.join(roomId);

    io.to(roomId).emit("room:updated", {
      room,
      players: getPlayersInRoom(roomId),
    });

    if (typeof cb === "function")
      cb({
        ok: true,
        room,
        ticketIndex,
      });
  });

  socket.on("room:join", (payload, cb) => {
    const { roomId, userId, name } = payload || {};
    if (!roomId || !userId) {
      if (typeof cb === "function")
        cb({ ok: false, error: "roomId and userId required" });
      return;
    }

    const room = getRoom(roomId);
    if (!room) {
      if (typeof cb === "function") cb({ ok: false, error: "room not found" });
      return;
    }

    initRoomPlayers(roomId);
    initRoomSocketMap(roomId);

    const ticketIndex = assignTicketIndex(roomId);
    if (ticketIndex === null) {
      if (typeof cb === "function")
        cb({ ok: false, error: "no tickets available" });
      return;
    }

    addPlayer(roomId, userId, {
      name: name || "Player",
      claims: 0,
      ticket: ticketIndex,
    });
    addSocket(roomId, socket.id, userId);
    socket.join(roomId);

    io.to(roomId).emit("room:updated", {
      room: getRoom(roomId),
      players: getPlayersInRoom(roomId),
    });

    if (typeof cb === "function")
      cb({
        ok: true,
        room: getRoom(roomId),
        ticketIndex,
      });
  });

  socket.on("room:leave", (payload, cb) => {
    const { roomId, userId } = payload || {};
    if (!roomId || !userId) {
      if (typeof cb === "function")
        cb({ ok: false, error: "roomId and userId required" });
      return;
    }

    const room = getRoom(roomId);
    if (!room) {
      if (typeof cb === "function") cb({ ok: false, error: "room not found" });
      return;
    }

    const player = getPlayer(roomId, userId);
    if (player && typeof player.ticket === "number") {
      releaseTicketIndex(roomId, player.ticket);
    }

    removePlayer(roomId, userId);
    removeSocket(roomId, socket.id);
    socket.leave(roomId);

    const players = getPlayersInRoom(roomId);
    if (players.length === 0) {
      cleanupRoom(io, roomId);
      if (typeof cb === "function") cb({ ok: true, removedRoom: true });
      return;
    }

    io.to(roomId).emit("room:updated", {
      room: getRoom(roomId),
      players,
    });

    if (typeof cb === "function") cb({ ok: true, removedRoom: false });
  });
}
