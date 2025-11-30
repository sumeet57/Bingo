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
  const [connected, setConnected] = useState(false);
  const [room, setRoom] = useState(null);
  const [players, setPlayers] = useState([]);
  const [ticketIndex, setTicketIndex] = useState(null);
  const [drawnNumbers, setDrawnNumbers] = useState([]);
  const [isHost, setIsHost] = useState(false);
  const [claims, setClaims] = useState(0);
  const [selectedNumbers, setSelectedNumbers] = useState([]);

  const resetState = () => {
    setRoom(null);
    setPlayers([]);
    setTicketIndex(null);
    setDrawnNumbers([]);
    setIsHost(false);
    setClaims(0);
    setSelectedNumbers([]);
  };

  useEffect(() => {
    const handleConnect = () => {
      console.log("Socket connected:", socket.id);
      setConnected(true);
    };

    const handleDisconnect = () => {
      console.log("Socket disconnected");
      setConnected(false);
    };

    const handleRoomUpdated = ({ room, players }) => {
      setRoom(room);
      setPlayers(players);

      if (currentUser?._id) {
        const me = players.find((p) => p.userId === currentUser._id);
        if (me) {
          setIsHost(me.role === "host");
          if (typeof me.ticket === "number") {
            setTicketIndex(me.ticket);
          }
        }
      }
    };

    const handleGameStarted = ({ roomId }) => {
      console.log("Game started in room:", roomId);
      setRoom((prev) => (prev ? { ...prev, status: "ongoing" } : prev));
    };

    const handleNumberCalled = ({ drawnNumber }) => {
      setDrawnNumbers(drawnNumber || []);
    };

    const handleClaimAccepted = (data) => {
      if (currentUser?._id && data.userId === currentUser._id) {
        setClaims(data.claims ?? 0);
        const session = loadBingoSession();
        if (session) {
          saveBingoSession({
            ...session,
            claims: data.claims ?? 0,
          });
        }
      }
    };

    const handleGameOver = (data) => {
      console.log("Game over:", data);
      toast.success(`Game Over! Winners: ${data.winnerNames.join(", ")}`, {
        autoClose: 10000,
        position: "top-center",
      });
      clearBingoSession();
      resetState();
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("room:updated", handleRoomUpdated);
    socket.on("bingo:started", handleGameStarted);
    socket.on("bingo:number_called", handleNumberCalled);
    socket.on("bingo:claim_accepted", handleClaimAccepted);
    socket.on("bingo:game_over", handleGameOver);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("room:updated", handleRoomUpdated);
      socket.off("bingo:started", handleGameStarted);
      socket.off("bingo:number_called", handleNumberCalled);
      socket.off("bingo:claim_accepted", handleClaimAccepted);
      socket.off("bingo:game_over", handleGameOver);
    };
  }, [currentUser?._id]);

  const createRoom = ({ roomId, winnerLimit }) =>
    new Promise((resolve) => {
      if (!currentUser?._id) {
        return resolve({ ok: false, error: "no user" });
      }

      socket.emit(
        "room:create",
        {
          hostUserId: currentUser._id,
          hostName: currentUser?.fullName?.firstName || "Host",
          winnerLimit,
          roomId,
        },
        (res) => {
          if (res?.ok) {
            saveBingoSession({
              userId: currentUser._id,
              roomId: res.room?.id || roomId,
              ticketIndex: res.ticketIndex,
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
      if (!currentUser?._id) {
        return resolve({ ok: false, error: "no user" });
      }

      socket.emit(
        "room:join",
        {
          roomId,
          userId: currentUser._id,
          name: currentUser?.fullName?.firstName || "Player",
        },
        (res) => {
          if (res?.ok) {
            saveBingoSession({
              userId: currentUser._id,
              roomId: res.room?.id || roomId,
              ticketIndex: res.ticketIndex,
              claims: 0,
              selectedNumbers: [],
            });
          }
          resolve(res || { ok: false });
        }
      );
    });

  const startGame = () =>
    new Promise((resolve) => {
      if (!room?.id) return resolve({ ok: false, error: "no room" });
      socket.emit("bingo:start", { roomId: room.id }, (res) => {
        resolve(res || { ok: false });
      });
    });

  const callNextNumber = () =>
    new Promise((resolve) => {
      if (!room?.id) return resolve({ ok: false, error: "no room" });
      socket.emit("bingo:call_number", { roomId: room.id }, (res) => {
        resolve(res || { ok: false });
      });
    });

  const claimPattern = (numbersToClaim) =>
    new Promise((resolve) => {
      if (!room?.id || !currentUser?._id) {
        return resolve({ ok: false, error: "no room or user" });
      }

      socket.emit(
        "bingo:claim",
        {
          roomId: room.id,
          userId: currentUser._id,
          claimType: "pattern",
          selectedNumbers: numbersToClaim,
        },
        (res) => {
          if (res?.ok) {
            const session = loadBingoSession();
            if (session) {
              saveBingoSession({
                ...session,
                claims: res.claims,
              });
            }
            if (typeof res.claims === "number") {
              setClaims(res.claims);
            }
          }
          resolve(res || { ok: false });
        }
      );
    });

  const updateSelectedNumbers = (arr) => {
    setSelectedNumbers(arr);
    const session = loadBingoSession();
    if (session) {
      saveBingoSession({
        ...session,
        selectedNumbers: arr,
      });
    }
  };

  const rejoinIfPossible = () =>
    new Promise((resolve) => {
      const session = loadBingoSession();
      if (!session?.roomId || !session?.userId) {
        return resolve({ ok: false, error: "no session" });
      }

      socket.emit(
        "room:rejoin",
        { roomId: session.roomId, userId: session.userId },
        (res) => {
          if (res?.ok) {
            setRoom(res.room);
            setPlayers(res.players || []);
            setDrawnNumbers(res.drawnNumber || []);

            const me = res.players?.find((p) => p.userId === session.userId);
            if (me) {
              setIsHost(me.role === "host");
              if (typeof me.ticket === "number") {
                setTicketIndex(me.ticket);
              }
            }

            setClaims(session.claims ?? 0);
            setSelectedNumbers(session.selectedNumbers || []);
          }
          resolve(res || { ok: false });
        }
      );
    });

  const value = {
    state: {
      connected,
      room,
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
      setSelectedNumbers: updateSelectedNumbers,
      rejoinIfPossible,
      resetState,
    },
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};

export const useSocketContext = () => useContext(SocketContext);
