// src/pages/Room.jsx
import { useEffect, useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import socket from "../components/socket";

const Room = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const { state } = useLocation();

  const roomId = state?.roomId;
  const myTicketIndex = state?.ticketIndex;

  const [room, setRoom] = useState(null);
  const [players, setPlayers] = useState([]);
  const [gameStatus, setGameStatus] = useState("pending");
  const [starting, setStarting] = useState(false);
  const [isHost, setIsHost] = useState(false);

  useEffect(() => {
    if (!roomId || !user?._id) {
      navigate("/");
      return;
    }

    const handleRoomUpdated = ({ room, players }) => {
      setRoom(room);
      setPlayers(players);
      setGameStatus(room.status);

      const hostPlayer = players.find(
        (p) => p.userId === user._id && p.role === "host"
      );
      setIsHost(Boolean(hostPlayer));
    };

    const handleGameStarted = () => {
      setGameStatus("ongoing");
      navigate("/game", {
        state: {
          roomId,
          ticketIndex: myTicketIndex,
          isHost,
        },
      });
    };

    const handleGameOver = () => {
      navigate("/");
    };

    socket.on("room:updated", handleRoomUpdated);
    socket.on("bingo:started", handleGameStarted);
    socket.on("bingo:game_over", handleGameOver);

    return () => {
      socket.off("room:updated", handleRoomUpdated);
      socket.off("bingo:started", handleGameStarted);
      socket.off("bingo:game_over", handleGameOver);
    };
  }, [roomId, user?._id, myTicketIndex, isHost, navigate]);

  const handleStartGame = () => {
    if (!roomId) return;
    setStarting(true);
    socket.emit("bingo:start", { roomId }, (res) => {
      if (!res?.ok) {
        console.error("Start failed:", res?.error);
        setStarting(false);
      }
    });
  };

  return (
    <div className="min-h-screen w-full bg-zinc-900 text-white flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold mt-4">Room #{roomId}</h1>
      <p className="text-sm text-zinc-400">
        Your Ticket Index: {myTicketIndex}
      </p>
      <p className="text-xs mt-1">
        Status:{" "}
        <span
          className={
            gameStatus === "pending"
              ? "text-yellow-400"
              : gameStatus === "ongoing"
              ? "text-green-400"
              : "text-red-400"
          }
        >
          {gameStatus}
        </span>
      </p>

      <div className="w-full max-w-2xl bg-zinc-800 mt-6 p-5 rounded-xl border border-zinc-700 shadow-md">
        <h2 className="text-xl font-semibold mb-3">Players in Room</h2>

        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {players.map((p, i) => (
            <div
              key={i}
              className="flex justify-between items-center bg-zinc-700/40 px-4 py-2 rounded-md border border-zinc-600"
            >
              <div>
                <span className="font-medium">{p.name}</span>
                {p.userId === user?._id && (
                  <span className="ml-2 text-xs text-emerald-400">(You)</span>
                )}
                {p.role === "host" && (
                  <span className="ml-2 text-[10px] uppercase text-amber-400 border border-amber-400/60 px-1 py-[1px] rounded">
                    Host
                  </span>
                )}
              </div>
              <span className="text-zinc-400 text-sm">Ticket #{p.ticket}</span>
            </div>
          ))}
        </div>
      </div>

      {isHost && gameStatus === "pending" && (
        <button
          className={`mt-6 px-6 py-3 font-semibold rounded-md transition ${
            starting
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-green-500 hover:bg-green-600 active:bg-green-700"
          }`}
          disabled={starting}
          onClick={handleStartGame}
        >
          {starting ? "Starting..." : "Start Game"}
        </button>
      )}

      {gameStatus === "ongoing" && (
        <p className="text-green-400 font-semibold mt-6 text-lg">
          Game is live — redirecting to board...
        </p>
      )}
    </div>
  );
};

export default Room;
