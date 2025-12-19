import redis from "../config/redis.js";
import { K } from "./constants.js";

export const addSocket = async (rId, sId, uId) => {
  const key = K.SOCKETS(rId);

  const pipe = redis.pipeline();
  pipe.hset(key, sId, uId);
  pipe.expire(key, 7200);

  await pipe.exec();
};

export const removeSocket = (rId, sId) => redis.hdel(K.SOCKETS(rId), sId);
