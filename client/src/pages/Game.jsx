import { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { UserContext } from "../context/UserContext";
import { useSocketContext } from "../context/SocketContext";
import socket from "../components/socket";

const GRID_SIZE = 5;

const Game = () => {
  const { user } = useContext(UserContext);
  const { state, actions } = useSocketContext();
  const { drawnNumbers, claims, isHost, selectedNumbers, room } = state;

  const navigate = useNavigate();
  const { state: navState } = useLocation();

  const roomId = room?.id || navState?.roomId;
  const ticketIndexFromNav = navState?.ticketIndex ?? state.ticketIndex;

  const [ticket, setTicket] = useState(null);
  const [loadingTicket, setLoadingTicket] = useState(true);

  // cells user has clicked, e.g. ["0-0","0-1","0-2","0-3","0-4"]
  const [selectedCells, setSelectedCells] = useState([]);
  // numbers that have been successfully claimed (for visual strike-through)
  const [claimedNumbers, setClaimedNumbers] = useState([]);

  useEffect(() => {
    if (!user?._id || !roomId) {
      toast.error("Missing user or room. Redirecting...");
      navigate("/");
      return;
    }

    setLoadingTicket(true);
    socket.emit("bingo:get_ticket", { roomId, userId: user._id }, (res) => {
      setLoadingTicket(false);
      if (!res?.ok) {
        toast.error(res?.error || "Failed to load ticket.");
        navigate("/");
        return;
      }
      setTicket(res.ticket);
    });
  }, [user?._id, roomId, navigate]);

  const isNumberDrawn = (value) =>
    typeof value === "number" && drawnNumbers.includes(value);

  const isNumberClaimed = (value) =>
    typeof value === "number" && claimedNumbers.includes(value);

  const isCellSelected = (key) => selectedCells.includes(key);

  const toggleCellSelection = (value, key) => {
    setSelectedCells((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );

    if (typeof value === "number") {
      const alreadySelected = selectedNumbers.includes(value);
      const updated = alreadySelected
        ? selectedNumbers.filter((n) => n !== value)
        : [...selectedNumbers, value];
      actions.setSelectedNumbers(updated);
    }
  };

  const handleCallNumber = async () => {
    const res = await actions.callNextNumber();
    if (!res.ok) {
      toast.error(res.error || "Failed to call number.");
      return;
    }
    toast.success(`Number called: ${res.number}`);
  };

  // 🔍 validate selectedCells form exactly one straight line
  const isValidStraightLine = (cells) => {
    if (cells.length !== GRID_SIZE) return false;

    const coords = cells.map((key) => {
      const [r, c] = key.split("-").map((x) => parseInt(x, 10));
      return { r, c };
    });

    const rows = new Set(coords.map((p) => p.r));
    const cols = new Set(coords.map((p) => p.c));

    // horizontal
    if (rows.size === 1 && cols.size === GRID_SIZE) return true;

    // vertical
    if (cols.size === 1 && rows.size === GRID_SIZE) return true;

    // main diagonal (0,0) .. (4,4)
    const isMainDiag = coords.every((p) => p.r === p.c);
    if (isMainDiag) {
      const diagRows = new Set(coords.map((p) => p.r));
      if (diagRows.size === GRID_SIZE) return true;
    }

    // anti diagonal (0,4) .. (4,0)
    const isAntiDiag = coords.every((p) => p.r + p.c === GRID_SIZE - 1);
    if (isAntiDiag) {
      const diagRows = new Set(coords.map((p) => p.r));
      if (diagRows.size === GRID_SIZE) return true;
    }

    return false;
  };

  const handleClaim = async () => {
    if (!roomId || !user?._id) return;

    if (selectedCells.length !== GRID_SIZE) {
      toast.error("Select exactly 5 cells (one full line) before claiming.");
      return;
    }

    if (!isValidStraightLine(selectedCells)) {
      toast.error(
        "Selected cells must form one straight line (row/col/diagonal)."
      );
      return;
    }

    const numbersToClaim = [...selectedNumbers];

    if (numbersToClaim.length < 4 || numbersToClaim.length > 5) {
      toast.error(
        "Invalid line: it must contain 4 or 5 drawn numbers (center can be FREE)."
      );
      return;
    }

    const res = await actions.claimPattern(numbersToClaim);
    if (!res.ok) {
      toast.error(res.error || "Claim rejected.");
      return;
    }

    toast.success("Claim accepted!");

    setClaimedNumbers((prev) => [...new Set([...prev, ...numbersToClaim])]);
    actions.setSelectedNumbers([]);
    setSelectedCells([]);
  };

  const bingoLetters = "BINGO".split("");

  return (
    <div className="min-h-screen w-full bg-zinc-900 text-white flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold mt-2 mb-2">Game Board</h1>
      <p className="text-sm text-zinc-400 mb-1">
        Room #{roomId} · Ticket #{ticketIndexFromNav}
      </p>

      <div className="flex items-center gap-2 mb-4">
        {bingoLetters.map((letter, i) => (
          <span
            key={i}
            className={`text-2xl font-extrabold tracking-wider ${
              claims > i ? "line-through text-emerald-400" : "text-zinc-500"
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

          {loadingTicket ? (
            <p className="text-sm text-zinc-400">Loading ticket...</p>
          ) : ticket ? (
            <div className="grid grid-cols-5 gap-2">
              {ticket.map((row, rIdx) =>
                row.map((value, cIdx) => {
                  const key = `${rIdx}-${cIdx}`;
                  const isFreeCell =
                    value === "FREE" || value === null || value === undefined;
                  const drawn = isNumberDrawn(value);
                  const claimed = isNumberClaimed(value);
                  const selected = isCellSelected(key);

                  let baseClasses =
                    "w-12 h-12 flex items-center justify-center rounded-md text-sm font-semibold border transition-all";

                  if (isFreeCell) {
                    baseClasses +=
                      " bg-purple-500/40 border-purple-400 text-white";
                  } else if (claimed) {
                    baseClasses +=
                      " bg-emerald-600/60 border-emerald-400 line-through";
                  } else if (drawn) {
                    baseClasses += " bg-emerald-500/30 border-emerald-400";
                  } else {
                    baseClasses += " bg-zinc-700/80 border-zinc-600";
                  }

                  if (selected) {
                    baseClasses += " ring-2 ring-yellow-400";
                  }

                  return (
                    <button
                      key={key}
                      onClick={() => toggleCellSelection(value, key)}
                      className={baseClasses}
                    >
                      {isFreeCell ? "★" : value}
                    </button>
                  );
                })
              )}
            </div>
          ) : (
            <p className="text-sm text-zinc-400">No ticket found.</p>
          )}

          <button
            onClick={handleClaim}
            className="mt-4 w-full py-2 rounded-md font-semibold transition bg-blue-500 hover:bg-blue-600 active:bg-blue-700"
          >
            Claim Pattern
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
              className="mt-4 w-full py-2 rounded-md font-semibold transition bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700"
            >
              Call Next Number
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Game;
