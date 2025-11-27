// src/pages/Game.jsx
import { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import socket from "../components/socket";

const Game = () => {
  const { user } = useContext(UserContext);
  const { state } = useLocation();
  const navigate = useNavigate();

  const roomId = state?.roomId;
  const ticketIndex = state?.ticketIndex;
  const isHost = state?.isHost || false;

  const [ticket, setTicket] = useState(null);
  const [drawnNumbers, setDrawnNumbers] = useState([]);
  const [selectedNumbers, setSelectedNumbers] = useState(new Set());
  const [claimCount, setClaimCount] = useState(0);
  const [calling, setCalling] = useState(false);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    if (!roomId || !user?._id) {
      navigate("/");
      return;
    }

    socket.emit("bingo:get_ticket", { roomId, userId: user._id }, (res) => {
      if (!res?.ok) {
        console.error("Failed to load ticket:", res?.error);
        navigate("/");
        return;
      }
      setTicket(res.ticket);
    });

    const handleNumberCalled = ({ number, drawnNumber }) => {
      setDrawnNumbers(drawnNumber);
    };

    const handleClaimAccepted = (data) => {
      if (data.userId === user._id) {
        setClaimCount(data.claims);
      }
    };

    const handleGameOver = (data) => {
      alert(`Game Over! Winners: ${data.room.winner.join(", ")}`);
      navigate("/");
    };

    socket.on("bingo:number_called", handleNumberCalled);
    socket.on("bingo:claim_accepted", handleClaimAccepted);
    socket.on("bingo:game_over", handleGameOver);

    return () => {
      socket.off("bingo:number_called", handleNumberCalled);
      socket.off("bingo:claim_accepted", handleClaimAccepted);
      socket.off("bingo:game_over", handleGameOver);
    };
  }, [roomId, user?._id, navigate]);

  const toggleNumberSelection = (value) => {
    if (value === "FREE") return;
    setSelectedNumbers((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  };

  const handleCallNumber = () => {
    if (!isHost || !roomId) return;
    setCalling(true);
    socket.emit("bingo:call_number", { roomId }, (res) => {
      setCalling(false);
      if (!res?.ok) {
        console.error("Call number failed:", res?.error);
      }
    });
  };

  const handleClaim = () => {
    if (!roomId || !user?._id) return;
    if (selectedNumbers.size === 0) {
      alert("Select at least one number to claim a pattern.");
      return;
    }
    setClaiming(true);

    socket.emit(
      "bingo:claim",
      {
        roomId,
        userId: user._id,
        claimType: "pattern",
        selectedNumbers: Array.from(selectedNumbers),
      },
      (res) => {
        setClaiming(false);
        if (!res?.ok) {
          alert(res?.error || "Claim rejected");
          return;
        }
        alert("Claim accepted!");
      }
    );
  };

  const isNumberDrawn = (value) =>
    typeof value === "number" && drawnNumbers.includes(value);

  const isNumberSelected = (value) =>
    typeof value === "number" && selectedNumbers.has(value);

  const bingoLetters = "BINGO".split("");

  return (
    <div className="min-h-screen w-full bg-zinc-900 text-white flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold mt-2 mb-2">Game Board</h1>
      <p className="text-sm text-zinc-400 mb-1">
        Room #{roomId} · Ticket #{ticketIndex}
      </p>

      <div className="flex items-center gap-2 mb-4">
        {bingoLetters.map((letter, i) => (
          <span
            key={i}
            className={`text-2xl font-extrabold tracking-wider ${
              claimCount > i ? "line-through text-emerald-400" : "text-zinc-500"
            }`}
          >
            {letter}
          </span>
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start mt-4">
        <div className="bg-zinc-800 border border-zinc-700 rounded-2xl p-4 shadow-lg">
          <h2 className="text-lg font-semibold mb-3 text-center">
            Your Ticket
          </h2>
          {ticket ? (
            <div className="grid grid-cols-5 gap-2">
              {ticket.map((row, rIdx) =>
                row.map((value, cIdx) => {
                  const drawn = isNumberDrawn(value);
                  const selected = isNumberSelected(value);
                  const isFree = value === "FREE";
                  return (
                    <button
                      key={`${rIdx}-${cIdx}`}
                      onClick={() => toggleNumberSelection(value)}
                      className={`w-12 h-12 flex items-center justify-center rounded-md text-sm font-semibold border
                        ${
                          isFree
                            ? "bg-purple-500/40 border-purple-400 text-white"
                            : drawn
                            ? "bg-emerald-500/40 border-emerald-400"
                            : "bg-zinc-700/80 border-zinc-600"
                        }
                        ${selected ? "ring-2 ring-yellow-400" : ""}
                      `}
                    >
                      {isFree ? "★" : value}
                    </button>
                  );
                })
              )}
            </div>
          ) : (
            <p className="text-sm text-zinc-400">Loading ticket...</p>
          )}

          <button
            onClick={handleClaim}
            disabled={claiming}
            className={`mt-4 w-full py-2 rounded-md font-semibold transition ${
              claiming
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600 active:bg-blue-700"
            }`}
          >
            {claiming ? "Submitting Claim..." : "Claim Pattern"}
          </button>
        </div>

        <div className="bg-zinc-800 border border-zinc-700 rounded-2xl p-4 shadow-lg w-full max-w-xs">
          <h2 className="text-lg font-semibold mb-3">Drawn Numbers</h2>

          <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto">
            {drawnNumbers.length === 0 ? (
              <p className="text-sm text-zinc-400">No numbers drawn yet.</p>
            ) : (
              drawnNumbers.map((n) => (
                <span
                  key={n}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-zinc-700 text-sm border border-zinc-500"
                >
                  {n}
                </span>
              ))
            )}
          </div>

          {isHost && (
            <button
              onClick={handleCallNumber}
              disabled={calling}
              className={`mt-4 w-full py-2 rounded-md font-semibold transition ${
                calling
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700"
              }`}
            >
              {calling ? "Calling..." : "Call Next Number"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Game;
