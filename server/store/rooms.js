const rooms = new Map();

export function createRoom(roomId, options = {}) {
  if (rooms.has(roomId)) return rooms.get(roomId);
  const room = {
    id: roomId,
    drawnNumber: [],
    status: "pending",
    winnerLimit: options.winnerLimit || 1,
    winner: [],
    assignedTickets: [],
  };
  rooms.set(roomId, room);
  return room;
}

export function updateRoom(roomId, data) {
  const room = rooms.get(roomId);
  if (!room) return null;
  const updated = { ...room, ...data };
  rooms.set(roomId, updated);
  return updated;
}

export function getRoom(roomId) {
  return rooms.get(roomId) ?? null;
}

export function hasRoom(roomId) {
  return rooms.has(roomId);
}

export function getAllRooms() {
  return Array.from(rooms.values());
}

export function setRoomStatus(roomId, status) {
  const room = rooms.get(roomId);
  if (!room) return null;
  room.status = status;
  return room;
}

export function addDrawnNumber(roomId, number) {
  const room = rooms.get(roomId);
  if (!room) return null;
  if (!room.drawnNumber.includes(number)) room.drawnNumber.push(number);
  return room;
}

export function assignTicketIndex(roomId) {
  const room = rooms.get(roomId);
  if (!room) return null;
  if (room.assignedTickets.length >= 100) return null;
  let index;
  do {
    index = Math.floor(Math.random() * 100);
  } while (room.assignedTickets.includes(index));
  room.assignedTickets.push(index);
  return index; // return between 0-99
}

export function releaseTicketIndex(roomId, index) {
  const room = rooms.get(roomId);
  if (!room) return null;
  room.assignedTickets = room.assignedTickets.filter((i) => i !== index);
  return index;
}

export function registerWinner(roomId, userId) {
  const room = rooms.get(roomId);
  if (!room) return { status: "invalid-room" };
  if (room.winner.includes(userId)) {
    return {
      status: "duplicate",
      index: room.winner.indexOf(userId),
    };
  }
  if (room.winner.length < room.winnerLimit) {
    room.winner.push(userId);
    if (room.winner.length >= room.winnerLimit) room.status = "completed";
    return {
      status: "accepted",
      index: room.winner.length - 1,
      rank: room.winner.length,
    };
  }
  return { status: "limit-reached" };
}

export function isGameOver(roomId) {
  const room = rooms.get(roomId);
  if (!room) return false;
  return room.winner.length >= room.winnerLimit;
}

export function deleteRoom(roomId) {
  return rooms.delete(roomId);
}

export default {
  createRoom,
  updateRoom,
  getRoom,
  hasRoom,
  getAllRooms,
  setRoomStatus,
  addDrawnNumber,
  assignTicketIndex,
  releaseTicketIndex,
  registerWinner,
  isGameOver,
  deleteRoom,
};
