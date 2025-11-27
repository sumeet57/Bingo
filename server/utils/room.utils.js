import { hasRoom } from "../store/rooms.js";

export const generateRoomId = () => {
  // numeric 6 digit ID which does not exist in rooms map
  let exists = true;
  let roomId;
  while (exists) {
    roomId = Math.floor(100000 + Math.random() * 900000).toString();
    exists = hasRoom(roomId);
  }
  return roomId;
};
