import redis from "../config/redis.js";
import { K } from "../store/constants.js";
import { createRoomAtomic, assignTicketAtomic } from "../store/rooms.js";
import { addPlayer, removePlayer, getPlayer } from "../store/players.js";

export default function registerRoomHandlers(io, socket) {
  socket.on("room:create", async (p, cb) => {
    const { roomId, hostUserId, hostName, winnerLimit } = p;

    await createRoomAtomic(roomId, winnerLimit);

    const ticket = await assignTicketAtomic(roomId);
    if (ticket === null) return cb?.({ ok: false });

    await addPlayer(roomId, hostUserId, hostName, ticket, "host");
    await redis.hset(K.SOCKETS(roomId), socket.id, hostUserId);

    socket.join(roomId);

    io.to(roomId).emit("player:joined", {
      userId: hostUserId,
      name: hostName,
      ticketIndex: ticket,
      role: "host",
    });

    cb?.({ ok: true, ticketIndex: ticket });
  });

  socket.on("room:join", async ({ roomId, userId, name }, cb) => {
    const ticket = await assignTicketAtomic(roomId);
    if (ticket === null) return cb?.({ ok: false });

    await addPlayer(roomId, userId, name, ticket);
    await redis.hset(K.SOCKETS(roomId), socket.id, userId);

    socket.join(roomId);

    io.to(roomId).emit("player:joined", { userId, name, ticketIndex: ticket });
    cb?.({ ok: true, ticketIndex: ticket });
  });

  socket.on("room:leave", async ({ roomId, userId }) => {
    await removePlayer(roomId, userId);
    io.to(roomId).emit("player:left", userId);
  });
}
