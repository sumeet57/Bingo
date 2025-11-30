// server/sockets/bingoGame.handler.js
import {
  getRoom,
  setRoomStatus,
  addDrawnNumber,
  registerWinner,
  isGameOver,
  deleteRoom,
} from "../store/rooms.js";
import {
  getPlayer,
  getPlayersInRoom,
  incrementPlayerClaims,
  clearRoomPlayers,
} from "../store/players.js";
import { clearRoomSockets } from "../store/sockets.js";
import tickets from "../store/tickets.js";
import RoomModel from "../models/room.model.js";

function cleanupRoom(io, roomId) {
  clearRoomPlayers(roomId);
  clearRoomSockets(roomId);
  deleteRoom(roomId);
  io.in(roomId).socketsLeave(roomId);
}

function getRandomNumberNotDrawn(room) {
  if (!room) return null;
  if (room.drawnNumber.length >= 99) return null;
  let n;
  do {
    n = Math.floor(Math.random() * 99) + 1;
  } while (room.drawnNumber.includes(n));
  return n;
}

export default function registerBingoGameHandlers(io, socket) {
  socket.on("bingo:start", (payload, cb) => {
    const reply = typeof cb === "function" ? cb : () => {};
    const { roomId } = payload || {};

    const room = getRoom(roomId);
    if (!room) {
      return reply({ ok: false, error: "room not found" });
    }

    setRoomStatus(roomId, "ongoing");
    io.to(roomId).emit("bingo:started", { roomId });
    console.log(`Bingo game started in room ${roomId}`);

    return reply({ ok: true });
  });

  socket.on("bingo:get_ticket", (payload, cb) => {
    const reply = typeof cb === "function" ? cb : () => {};
    const { roomId, userId } = payload || {};
    const room = getRoom(roomId);
    if (!room) return reply({ ok: false, error: "room not found" });

    const player = getPlayer(roomId, userId);
    if (!player || typeof player.ticket !== "number") {
      return reply({ ok: false, error: "player or ticket not found" });
    }

    const ticketIndex = String(player.ticket);
    const ticketGrid = tickets[ticketIndex];
    if (!ticketGrid)
      return reply({ ok: false, error: "ticket data not found" });

    return reply({
      ok: true,
      ticketIndex: player.ticket,
      ticket: ticketGrid,
    });
  });

  socket.on("bingo:call_number", (payload, cb) => {
    const reply = typeof cb === "function" ? cb : () => {};
    const { roomId } = payload || {};
    const room = getRoom(roomId);
    if (!room) return reply({ ok: false, error: "room not found" });

    const number = getRandomNumberNotDrawn(room);
    if (number === null) return reply({ ok: false, error: "no numbers left" });

    addDrawnNumber(roomId, number);
    const updatedRoom = getRoom(roomId);

    io.to(roomId).emit("bingo:number_called", {
      roomId,
      number,
      drawnNumber: updatedRoom.drawnNumber,
    });

    return reply({
      ok: true,
      number,
      drawnNumber: updatedRoom.drawnNumber,
    });
  });

  socket.on("bingo:claim", async (payload, cb) => {
    const reply = typeof cb === "function" ? cb : () => {};
    const { roomId, userId, claimType, selectedNumbers } = payload || {};

    const room = getRoom(roomId);
    if (!room) return reply({ ok: false, error: "room not found" });

    const player = getPlayer(roomId, userId);
    if (!player) return reply({ ok: false, error: "player not found" });

    if (!Array.isArray(selectedNumbers) || selectedNumbers.length === 0) {
      return reply({ ok: false, error: "no numbers selected" });
    }

    // ✅ 4 numbers if line contains FREE, 5 numbers otherwise
    if (selectedNumbers.length < 4 || selectedNumbers.length > 5) {
      return reply({ ok: false, error: "invalid line length" });
    }

    const invalid = selectedNumbers.some((n) => !room.drawnNumber.includes(n));
    if (invalid) {
      return reply({
        ok: false,
        error: "invalid pattern: some numbers not drawn",
      });
    }

    const updatedPlayer = incrementPlayerClaims(roomId, userId);
    const claims = updatedPlayer.claims;

    let winnerResult = null;
    if (claims >= 5) {
      winnerResult = registerWinner(roomId, userId);
      if (winnerResult.status === "accepted") {
        io.to(roomId).emit("bingo:claim_accepted", {
          roomId,
          userId,
          claimType,
          rank: winnerResult.rank,
          claims,
        });

        if (isGameOver(roomId)) {
          const finalRoom = getRoom(roomId);
          const players = getPlayersInRoom(roomId);

          try {
            await RoomModel.create({
              roomId: finalRoom.id,
              winner: finalRoom.winner,
              players,
            });
          } catch (e) {
            console.error("Failed to save room:", e);
          }

          io.to(roomId).emit("bingo:game_over", {
            room: finalRoom,
            players,
            winnerNames: finalRoom.winner.map((uid) => {
              const p = getPlayer(roomId, uid);
              return p ? p.name : "Unknown";
            }),
          });
          cleanupRoom(io, roomId);
        }

        return reply({ ok: true, result: winnerResult, claims });
      }

      if (winnerResult.status === "duplicate") {
        return reply({
          ok: false,
          error: "already winner",
          result: winnerResult,
        });
      }

      if (winnerResult.status === "limit-reached") {
        return reply({
          ok: false,
          error: "winner limit reached",
          result: winnerResult,
        });
      }
    }

    io.to(roomId).emit("bingo:claim_accepted", {
      roomId,
      userId,
      claimType,
      rank: null,
      claims,
    });

    return reply({ ok: true, result: { status: "partial-claim" }, claims });
  });
}
