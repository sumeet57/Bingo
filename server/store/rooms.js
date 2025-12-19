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
  const key = K.DRAWN(roomId);

  const pipe = redis.pipeline();
  pipe.sadd(key, n);
  pipe.expire(key, 7200);

  const [[, added]] = await pipe.exec();
  return added === 1;
}

export async function registerWinner(roomId, user) {
  const { userId, name } = user;

  const pipe = redis.pipeline();

  pipe.hget(K.ROOM(roomId), "wl");
  pipe.lpos(K.WINNERS(roomId), userId);
  pipe.llen(K.WINNERS(roomId));

  const [[, wl], [, exists], [, count]] = await pipe.exec();

  const winnerLimit = Number(wl);

  if (exists !== null) {
    return { status: "duplicate" };
  }

  if (count >= winnerLimit) {
    return { status: "limit" };
  }

  // Register winner
  const newRank = count + 1;
  await redis.rpush(K.WINNERS(roomId), userId);

  let completed = false;

  if (newRank >= winnerLimit) {
    await redis.hset(K.ROOM(roomId), "s", "completed");
    completed = true;
  }

  return {
    status: "accepted",
    rank: newRank,
    winner: {
      userId,
      name,
      rank: newRank,
    },
    completed,
  };
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
  // ONLY room hashes
  const roomKeys = await redis.keys("r:*");
  if (roomKeys.length === 0) return [];

  const pipe = redis.pipeline();
  roomKeys.forEach((key) => pipe.hgetall(key));

  const results = await pipe.exec();

  return results
    .map(([, room], i) => {
      if (!room || !room.s) return null; // must have status
      const roomId = roomKeys[i].slice(2); // remove "r:"
      return {
        id: roomId,
        s: room.s,
        wl: room.wl,
      };
    })
    .filter(Boolean);
}

export async function getRoom(roomId) {
  const roomData = await redis.hgetall(K.ROOM(roomId));
  if (Object.keys(roomData).length === 0) return null;
  return {
    roomId,
    s: roomData.s,
    wl: Number(roomData.wl),
  };
}
