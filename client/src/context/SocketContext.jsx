import React, { createContext, useContext, useEffect, useState } from "react";
import socket from "../components/socket";
import {
  saveBingoSession,
  loadBingoSession,
  clearBingoSession,
} from "../utils/bingoSession";
import { toast } from "react-toastify";

const SocketContext = createContext(null);

export const SocketProvider = ({ children, currentUser }) => {
  // 🔥 IMPORTANT: initialize from socket.connected
  const [connected, setConnected] = useState(socket.connected);

  const [roomId, setRoomId] = useState(null);
  const [players, setPlayers] = useState([]);
  const [ticketIndex, setTicketIndex] = useState(null);
  const [drawnNumbers, setDrawnNumbers] = useState([]);
  const [isHost, setIsHost] = useState(false);
  const [claims, setClaims] = useState(0);
  const [selectedNumbers, setSelectedNumbers] = useState([]);

  useEffect(() => {
    const session = loadBingoSession();
    if (!session) return;

    if (session.roomId && !roomId) {
      setRoomId(session.roomId);
    }

    if (
      session.ticketIndex !== undefined &&
      session.ticketIndex !== null &&
      ticketIndex === null
    ) {
      setTicketIndex(Number(session.ticketIndex));
    }

    if (typeof session.claims === "number") {
      setClaims(session.claims);
    }

    if (Array.isArray(session.selectedNumbers)) {
      setSelectedNumbers(session.selectedNumbers);
    }
  }, []);

  const resetState = () => {
    setRoomId(null);
    setPlayers([]);
    setTicketIndex(null);
    setDrawnNumbers([]);
    setIsHost(false);
    setClaims(0);
    setSelectedNumbers([]);
  };

  /* ---------------- SOCKET EVENTS ---------------- */

  useEffect(() => {
    const onConnect = () => {
      setConnected(true);
    };

    const onDisconnect = () => {
      setConnected(false);
    };

    const onPlayerJoined = (p) => {
      setPlayers((prev) => {
        if (prev.some((x) => x.userId === p.userId)) return prev;
        return [...prev, p];
      });

      if (p.userId === currentUser?._id) {
        setTicketIndex(p.ticket);
        setIsHost(p.role === "host");
      }
    };

    const onPlayerLeft = (userId) => {
      setPlayers((prev) => prev.filter((p) => p.userId !== userId));
    };

    const onBingoStarted = () => {
      // 🔔 notify Room.jsx via event
      window.dispatchEvent(new Event("bingo-start"));
    };

    const onNumberCalled = (n) => {
      setDrawnNumbers((prev) => (prev.includes(n) ? prev : [...prev, n]));
    };

    const onWinner = ({ userId, rank }) => {
      if (userId === currentUser?._id) {
        toast.success(`🎉 You won! Rank: ${rank}`);
      }
    };

    const onGameOver = () => {
      toast.info("Game over");
      clearBingoSession();
      resetState();
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("player:joined", onPlayerJoined);
    socket.on("player:left", onPlayerLeft);
    socket.on("bingo:started", onBingoStarted);
    socket.on("bingo:number", onNumberCalled);
    socket.on("winner", onWinner);
    socket.on("game_over", onGameOver);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("player:joined", onPlayerJoined);
      socket.off("player:left", onPlayerLeft);
      socket.off("bingo:started", onBingoStarted);
      socket.off("bingo:number", onNumberCalled);
      socket.off("winner", onWinner);
      socket.off("game_over", onGameOver);
    };
  }, [currentUser?._id]);

  /* ---------------- ACTIONS ---------------- */

  const createRoom = ({ roomId, winnerLimit }) =>
    new Promise((resolve) => {
      socket.emit(
        "room:create",
        {
          roomId,
          winnerLimit,
          hostUserId: currentUser._id,
          hostName: currentUser?.fullName?.firstName || "Host",
        },
        (res) => {
          if (res?.ok) {
            setRoomId(roomId);
            setTicketIndex(Number(res.ticketIndex));

            saveBingoSession({
              roomId,
              userId: currentUser._id,
              ticketIndex: Number(res.ticketIndex),
              claims: 0,
              selectedNumbers: [],
            });
          }
          resolve(res || { ok: false });
        }
      );
    });

  const joinRoom = (roomId) =>
    new Promise((resolve) => {
      socket.emit(
        "room:join",
        {
          roomId,
          userId: currentUser._id,
          name: currentUser?.fullName?.firstName || "Player",
        },
        (res) => {
          if (res?.ok) {
            setRoomId(roomId);
            setTicketIndex(Number(res.ticketIndex));

            saveBingoSession({
              roomId,
              userId: currentUser._id,
              ticketIndex: Number(res.ticketIndex),
              claims: 0,
              selectedNumbers: [],
            });
          }
          resolve(res || { ok: false });
        }
      );
    });

  const startGame = () => socket.emit("bingo:start", { roomId });
  const callNextNumber = () => socket.emit("bingo:call_number", { roomId });

  const claimPattern = (numbers) =>
    new Promise((resolve) => {
      socket.emit(
        "bingo:claim",
        {
          roomId,
          userId: currentUser._id,
          selectedNumbers: numbers,
        },
        (res) => {
          if (res?.ok && typeof res.claims === "number") {
            setClaims(res.claims);
          }
          resolve(res || { ok: false });
        }
      );
    });

  const getLobbyRooms = () =>
    new Promise((resolve) => {
      socket.emit("lobby:get_rooms", (rooms) => {
        resolve(rooms || []);
      });
    });

  return (
    <SocketContext.Provider
      value={{
        state: {
          connected,
          roomId,
          players,
          ticketIndex,
          drawnNumbers,
          isHost,
          claims,
          selectedNumbers,
        },
        actions: {
          createRoom,
          joinRoom,
          startGame,
          callNextNumber,
          claimPattern,
          setSelectedNumbers,
          resetState,
          getLobbyRooms,
        },
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocketContext = () => useContext(SocketContext);
