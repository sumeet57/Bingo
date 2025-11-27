const players = new Map();

export function initRoomPlayers(roomId) {
  if (!players.has(roomId)) players.set(roomId, new Map());
  return players.get(roomId);
}

export function addPlayer(roomId, userId, playerData) {
  const roomPlayers = initRoomPlayers(roomId);
  const existing = roomPlayers.get(userId) || {
    name: playerData.name || "",
    claims: 0,
    ticket: playerData.ticket ?? null,
  };
  const updated = { ...existing, ...playerData };
  roomPlayers.set(userId, updated);
  return updated;
}

export function hasPlayer(roomId, userId) {
  const roomPlayers = players.get(roomId);
  if (!roomPlayers) return false;
  return roomPlayers.has(userId);
}

export function getPlayer(roomId, userId) {
  const roomPlayers = players.get(roomId);
  if (!roomPlayers) return null;
  return roomPlayers.get(userId) || null;
}

export function getPlayersInRoom(roomId) {
  const roomPlayers = players.get(roomId);
  if (!roomPlayers) return [];
  return Array.from(roomPlayers.entries()).map(([uid, data]) => ({
    userId: uid,
    ...data,
  }));
}

export function removePlayer(roomId, userId) {
  const roomPlayers = players.get(roomId);
  if (!roomPlayers) return false;
  const deleted = roomPlayers.delete(userId);
  if (roomPlayers.size === 0) players.delete(roomId);
  return deleted;
}

export function clearRoomPlayers(roomId) {
  return players.delete(roomId);
}

export function incrementPlayerClaims(roomId, userId) {
  const roomPlayers = players.get(roomId);
  if (!roomPlayers) return null;
  const player = roomPlayers.get(userId);
  if (!player) return null;
  player.claims = (player.claims || 0) + 1;
  return player;
}

export function setPlayerTicket(roomId, userId, ticket) {
  const roomPlayers = initRoomPlayers(roomId);
  const player = roomPlayers.get(userId) || {
    name: "",
    claims: 0,
    ticket: null,
  };
  player.ticket = ticket;
  roomPlayers.set(userId, player);
  return player;
}

export function getRoomPlayersMap(roomId) {
  return players.get(roomId) || null;
}

export default {
  initRoomPlayers,
  addPlayer,
  hasPlayer,
  getPlayer,
  getPlayersInRoom,
  removePlayer,
  clearRoomPlayers,
  incrementPlayerClaims,
  setPlayerTicket,
  getRoomPlayersMap,
};
