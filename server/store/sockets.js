const socketMap = new Map();

export function initRoomSocketMap(roomId) {
  if (!socketMap.has(roomId)) socketMap.set(roomId, new Map());
  return socketMap.get(roomId);
}

export function addSocket(roomId, socketId, userId) {
  const roomSockets = initRoomSocketMap(roomId);
  roomSockets.set(socketId, userId);
  return { socketId, userId };
}

export function removeSocket(roomId, socketId) {
  const roomSockets = socketMap.get(roomId);
  if (!roomSockets) return false;
  const deleted = roomSockets.delete(socketId);
  if (roomSockets.size === 0) socketMap.delete(roomId);
  return deleted;
}

export function getUserIdBySocket(roomId, socketId) {
  const roomSockets = socketMap.get(roomId);
  if (!roomSockets) return null;
  return roomSockets.get(socketId) || null;
}

export function getSocketsByUser(roomId, userId) {
  const roomSockets = socketMap.get(roomId);
  if (!roomSockets) return [];
  const sockets = [];
  for (const [sid, uid] of roomSockets.entries()) {
    if (uid === userId) sockets.push(sid);
  }
  return sockets;
}

export function getRoomSocketMap(roomId) {
  return socketMap.get(roomId) || null;
}

export function clearRoomSockets(roomId) {
  return socketMap.delete(roomId);
}

export function removeSocketFromAllRooms(socketId) {
  for (const [roomId, roomSockets] of socketMap.entries()) {
    if (roomSockets.has(socketId)) {
      roomSockets.delete(socketId);
      if (roomSockets.size === 0) socketMap.delete(roomId);
    }
  }
}

export default {
  initRoomSocketMap,
  addSocket,
  removeSocket,
  getUserIdBySocket,
  getSocketsByUser,
  getRoomSocketMap,
  clearRoomSockets,
  removeSocketFromAllRooms,
};
