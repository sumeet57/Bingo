import {
  setRoomStatus,
  addDrawnNumber,
  registerWinner,
  cleanupRoom,
} from "../store/rooms.js";
import { incrementClaims } from "../store/players.js";
import redis from "../config/redis.js";
import { K } from "../store/constants.js";
import tickets from "../store/tickets.js";
import { getRoom } from "../store/rooms.js";

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

  socket.on("bingo:claim", async (payload, cb) => {
    try {
      const { roomId, userId, ticketIndex, pattern, player } = payload;

      const room = await getRoom(roomId);
      if (!room || room.s !== "ongoing") {
        return cb({ ok: false, error: "Invalid room" });
      }

      const ticket = tickets[ticketIndex];
      if (!ticket) {
        return cb({ ok: false, error: "Invalid ticket" });
      }

      const drawn = await redis.smembers(K.DRAWN(roomId));
      const drawnSet = new Set(drawn.map(Number));

      const patternNumbers = extractPatternNumbers(ticket, pattern);

      if (!isValidClaim(patternNumbers, drawnSet)) {
        return cb({ ok: false, error: "Invalid claim" });
      }

      const claims = await incrementClaims(roomId, userId);

      if (claims >= 5) {
        const res = await registerWinner(roomId, {
          userId,
          name: player.name,
        });

        if (res.status === "accepted") {
          io.to(roomId).emit("winner:added", res.winner);

          if (res.completed) {
            io.to(roomId).emit("game:over", {
              winners: res.winner,
            });
            await cleanupRoom(io, roomId);
          }

          return cb({
            ok: true,
            claims,
            status: res.status,
            rank: res.rank,
            completed: res.completed,
          });
        }
      }

      cb({ ok: true, claims });
    } catch (err) {
      console.error(err);
      cb({ ok: false, error: "Server error" });
    }
  });
}

function extractPatternNumbers(ticket, pattern) {
  const { type, index } = pattern;

  if (type === "row") {
    return ticket[index];
  }

  if (type === "col") {
    return ticket.map((row) => row[index]);
  }

  if (type === "diag") {
    // main diagonal
    if (index === 0) {
      return ticket.map((row, i) => row[i]);
    }
    // anti diagonal
    if (index === 1) {
      return ticket.map((row, i) => row[4 - i]);
    }
  }

  throw new Error("Invalid pattern");
}
function isValidClaim(patternNumbers, drawnNumbersSet) {
  return patternNumbers.every((n) => n === "null" || drawnNumbersSet.has(n));
}
