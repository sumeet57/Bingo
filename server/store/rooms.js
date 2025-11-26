let rooms = new Map();

export const getRoom = (roomId) => {
  return rooms.get(roomId);
};
export const saveRoom = (room) => {
  const exist = rooms.get(room.id);
  if (exist) {
    rooms.set(room.id, { ...exist, ...room });
  } else {
    rooms.set(room.id, room);
  }
};
export const deleteRoom = (roomId) => {
  rooms.delete(roomId);
};
