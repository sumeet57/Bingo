import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { UserContext } from "../context/UserContext";
import { useSocketContext } from "../context/SocketContext";
import { loadBingoSession } from "../utils/bingoSession";
import Ticket from "../components/Ticket";
import DrawnNumbers from "../components/DrawnNumbers";
import tickets from "../assets/tickets";

const GRID_SIZE = 5;
const BINGO_LETTERS = ["B", "I", "N", "G", "O"];

const Game = () => {
  const { user } = useContext(UserContext);
  const { state, actions } = useSocketContext();

  const {
    drawnNumbers,
    claims,
    isHost,
    selectedNumbers,
    roomId: ctxRoomId,
    ticketIndex: ctxTicketIndex,
  } = state;

  const navigate = useNavigate();
  const { state: navState } = useLocation();

  // ✅ load session ONCE
  const sessionRef = useRef(loadBingoSession());

  const roomId =
    ctxRoomId || navState?.roomId || sessionRef.current?.roomId || null;

  const rawTicketIndex =
    ctxTicketIndex ??
    navState?.ticketIndex ??
    sessionRef.current?.ticketIndex ??
    null;

  // 🔥 normalize ONCE
  const ticketIndex = rawTicketIndex !== null ? Number(rawTicketIndex) : null;

  const [hydrated, setHydrated] = useState(false);
  const [selectedCells, setSelectedCells] = useState([]);
  const [claimedNumbers, setClaimedNumbers] = useState([]);

  /* ---------------- HYDRATION ---------------- */

  useEffect(() => {
    setHydrated(true);
  }, []);

  /* ---------------- SAFE GUARD ---------------- */

  useEffect(() => {
    if (!hydrated) return;

    if (!user?._id || !roomId) {
      toast.error("Missing user or room. Redirecting...");
      navigate("/");
      return;
    }

    if (typeof ticketIndex !== "number" || Number.isNaN(ticketIndex)) {
      toast.error("Ticket not found. Redirecting...");
      navigate("/");
    }
  }, [hydrated, user?._id, roomId, ticketIndex, navigate]);

  /* ---------------- DERIVE TICKET ---------------- */

  const ticket = useMemo(() => {
    if (typeof ticketIndex !== "number" || Number.isNaN(ticketIndex)) {
      return null;
    }
    return tickets[ticketIndex];
  }, [ticketIndex]);
  /* ---------------- CELL SELECTION ---------------- */

  const toggleCellSelection = (value, key) => {
    setSelectedCells((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );

    if (typeof value === "number") {
      const updated = selectedNumbers.includes(value)
        ? selectedNumbers.filter((n) => n !== value)
        : [...selectedNumbers, value];

      actions.setSelectedNumbers(updated);
    }
  };

  const handleCallNumber = () => {
    actions.callNextNumber();
  };

  /* ---------------- CLAIM ---------------- */

  const isValidStraightLine = (cells) => {
    if (cells.length !== GRID_SIZE) return false;

    const coords = cells.map((key) => {
      const [r, c] = key.split("-").map(Number);
      return { r, c };
    });

    const rows = new Set(coords.map((p) => p.r));
    const cols = new Set(coords.map((p) => p.c));

    if (rows.size === 1 || cols.size === 1) return true;

    const mainDiag = coords.every((p) => p.r === p.c);
    const antiDiag = coords.every((p) => p.r + p.c === GRID_SIZE - 1);

    return mainDiag || antiDiag;
  };

  const handleClaim = async () => {
    if (selectedCells.length !== GRID_SIZE) {
      toast.error("Select exactly 5 cells.");
      return;
    }

    if (!isValidStraightLine(selectedCells)) {
      toast.error("Cells must form a straight line.");
      return;
    }

    if (selectedNumbers.length < 4 || selectedNumbers.length > 5) {
      toast.error("Invalid claim.");
      return;
    }

    const res = await actions.claimPattern([...selectedNumbers]);

    if (!res?.ok) {
      toast.error(res?.error || "Claim rejected.");
      return;
    }

    toast.success("Claim accepted!");

    setClaimedNumbers((prev) => [...new Set([...prev, ...selectedNumbers])]);

    actions.setSelectedNumbers([]);
    setSelectedCells([]);
  };

  /* ---------------- RENDER ---------------- */

  if (!ticket) return null; // prevent flicker

  return (
    <div className="min-h-screen w-full bg-zinc-900 text-white flex flex-col items-center p-6">
      <p className="text-sm text-zinc-400">
        Room #{roomId} · Ticket #{ticketIndex}
      </p>

      <DrawnNumbers
        drawnNumbers={drawnNumbers}
        isHost={isHost}
        onCallNext={handleCallNumber}
      />

      <div className="flex items-center gap-2 mt-3">
        {BINGO_LETTERS.map((letter, i) => (
          <span
            key={letter}
            className={`text-2xl font-extrabold ${
              claims > i ? "line-through text-emerald-400" : "text-zinc-500"
            }`}
          >
            {letter}
          </span>
        ))}
      </div>

      <div className="flex flex-col items-start mt-4">
        <Ticket
          ticket={ticket}
          drawnNumbers={drawnNumbers}
          claimedNumbers={claimedNumbers}
          selectedCells={selectedCells}
          onCellToggle={toggleCellSelection}
          onClaim={handleClaim}
        />
      </div>
    </div>
  );
};

export default Game;
