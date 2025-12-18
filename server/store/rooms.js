import redis from "../config/redis.js";
import { K } from "./constants.js";

export async function createRoomAtomic(roomId, winnerLimit = 1) {
  const pipe = redis.pipeline();
  pipe.hsetnx(K.ROOM(roomId), "s", "pending");
  pipe.hsetnx(K.ROOM(roomId), "wl", winnerLimit);
  pipe.setnx(K.TICKET_COUNTER(roomId), 0);
  pipe.expire(K.ROOM(roomId), 7200);
  pipe.expire(K.TICKET_COUNTER(roomId), 7200);
  await pipe.exec();
}

export async function assignTicketAtomic(roomId, max = 100) {
  const ticket = (await redis.incr(K.TICKET_COUNTER(roomId))) - 1;
  return ticket < max ? ticket : null;
}

export async function setRoomStatus(roomId, status) {
  await redis.hset(K.ROOM(roomId), "s", status);
}

export async function addDrawnNumber(roomId, n) {
  return (await redis.sadd(K.DRAWN(roomId), n)) === 1;
}

export async function registerWinner(roomId, userId) {
  const pipe = redis.pipeline();
  pipe.hget(K.ROOM(roomId), "wl");
  pipe.lpos(K.WINNERS(roomId), userId);
  pipe.llen(K.WINNERS(roomId));

  const [[, wl], [, exists], [, count]] = await pipe.exec();

  if (exists !== null) return { status: "duplicate" };
  if (count >= Number(wl)) return { status: "limit" };

  await redis.rpush(K.WINNERS(roomId), userId);

  if (count + 1 >= Number(wl)) {
    await redis.hset(K.ROOM(roomId), "s", "completed");
  }

  return { status: "accepted", rank: count + 1 };
}

export async function cleanupRoom(io, roomId) {
  const pipe = redis.pipeline();
  pipe.del(
    K.ROOM(roomId),
    K.TICKET_COUNTER(roomId),
    K.PLAYERS(roomId),
    K.CLAIMS(roomId),
    K.DRAWN(roomId),
    K.WINNERS(roomId),
    K.SOCKETS(roomId)
  );
  await pipe.exec();
  io.in(roomId).socketsLeave(roomId);
}

export async function getAllRooms() {
  const keys = await redis.keys("r:*");
  const rooms = [];
  for (const key of keys) {
    if (key.includes(":")) continue;
    const roomId = key.split(":")[1];
    const roomData = await redis.hgetall(K.ROOM(roomId));
    rooms.push({ roomId, ...roomData });
  }
  return rooms;
}
