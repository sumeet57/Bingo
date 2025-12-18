import redis from "../config/redis.js";
import { K } from "./constants.js";

export async function addPlayer(roomId, userId, name, ticket, role = "p") {
  const pipe = redis.pipeline();
  pipe.hset(K.PLAYERS(roomId), userId, `${name}|${ticket}|${role}`);
  pipe.hsetnx(K.CLAIMS(roomId), userId, 0);
  pipe.expire(K.PLAYERS(roomId), 3600);
  pipe.expire(K.CLAIMS(roomId), 3600);
  await pipe.exec();
}

export async function removePlayer(roomId, userId) {
  const pipe = redis.pipeline();
  pipe.hdel(K.PLAYERS(roomId), userId);
  pipe.hdel(K.CLAIMS(roomId), userId);
  await pipe.exec();
}

export async function getPlayer(roomId, userId) {
  const pipe = redis.pipeline();
  pipe.hget(K.PLAYERS(roomId), userId);
  pipe.hget(K.CLAIMS(roomId), userId);
  const [[, p], [, c]] = await pipe.exec();

  if (!p) return null;
  const [name, ticket, role] = p.split("|");

  return {
    userId,
    name,
    ticket: Number(ticket),
    role,
    claims: Number(c || 0),
  };
}

export async function incrementClaims(roomId, userId) {
  return redis.hincrby(K.CLAIMS(roomId), userId, 1);
}
