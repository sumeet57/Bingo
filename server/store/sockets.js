import redis from "../config/redis.js";
import { K } from "./constants.js";

export const addSocket = (rId, sId, uId) =>
  redis.hset(K.SOCKETS(rId), sId, uId);

export const removeSocket = (rId, sId) => redis.hdel(K.SOCKETS(rId), sId);
