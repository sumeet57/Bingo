import {
  setRoomStatus,
  addDrawnNumber,
  registerWinner,
  cleanupRoom,
} from "../store/rooms.js";
import { incrementClaims } from "../store/players.js";

export default function registerGameHandlers(io, socket) {
  socket.on("bingo:start", async ({ roomId }) => {
    await setRoomStatus(roomId, "ongoing");
    io.to(roomId).emit("bingo:started");
  });

  socket.on("bingo:call_number", async ({ roomId }) => {
    let n;
    do {
      n = Math.floor(Math.random() * 99) + 1;
    } while (!(await addDrawnNumber(roomId, n)));

    io.to(roomId).emit("bingo:number", n);
  });

  socket.on("bingo:claim", async ({ roomId, userId }, cb) => {
    const claims = await incrementClaims(roomId, userId);
    if (claims >= 5) {
      const res = await registerWinner(roomId, userId);
      if (res.status === "accepted") {
        io.to(roomId).emit("winner", res);
      }
    }
    cb?.({ ok: true });
  });
}
