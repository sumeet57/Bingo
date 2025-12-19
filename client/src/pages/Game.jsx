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
    roomId: ctxRoomId,
    ticketIndex: ctxTicketIndex,
  } = state;

  const navigate = useNavigate();
  const { state: navState } = useLocation();

  const sessionRef = useRef(loadBingoSession());

  const roomId =
    ctxRoomId || navState?.roomId || sessionRef.current?.roomId || null;

  const rawTicketIndex =
    ctxTicketIndex ??
    navState?.ticketIndex ??
    sessionRef.current?.ticketIndex ??
    null;

  const ticketIndex = rawTicketIndex !== null ? Number(rawTicketIndex) : null;

  const [hydrated, setHydrated] = useState(false);
  const [selectedCells, setSelectedCells] = useState([]);
  const [claimedNumbers, setClaimedNumbers] = useState([]);

  useEffect(() => setHydrated(true), []);

  useEffect(() => {
    if (!hydrated) return;

    if (!user?._id || !roomId) {
      toast.error("Missing user or room.");
      navigate("/");
      return;
    }

    if (!Number.isInteger(ticketIndex)) {
      toast.error("Ticket not found.");
      navigate("/");
    }
  }, [hydrated, user?._id, roomId, ticketIndex, navigate]);

  const ticket = useMemo(() => {
    if (!Number.isInteger(ticketIndex)) return null;
    return tickets[ticketIndex];
  }, [ticketIndex]);

  const handleCallNumber = () => {
    actions.callNextNumber();
  };

  /* ---------------- PATTERN DETECTION ---------------- */

  const detectPattern = (cells) => {
    if (cells.length !== GRID_SIZE) return null;

    const coords = cells.map((k) => k.split("-").map(Number));
    const rows = coords.map((c) => c[0]);
    const cols = coords.map((c) => c[1]);

    const sameRow = rows.every((r) => r === rows[0]);
    if (sameRow) return { type: "row", index: rows[0] };

    const sameCol = cols.every((c) => c === cols[0]);
    if (sameCol) return { type: "col", index: cols[0] };

    const mainDiag = coords.every(([r, c]) => r === c);
    if (mainDiag) return { type: "diag", index: 0 };

    const antiDiag = coords.every(([r, c]) => r + c === GRID_SIZE - 1);
    if (antiDiag) return { type: "diag", index: 1 };

    return null;
  };

  /* ---------------- CLAIM ---------------- */

  const handleClaim = async () => {
    const pattern = detectPattern(selectedCells);

    if (!pattern) {
      toast.error("Select a valid row, column, or diagonal.");
      return;
    }

    const res = await actions.claimPattern(pattern);

    if (!res?.ok) {
      toast.error(res?.error || "Claim rejected.");
      return;
    }

    toast.success("Claim accepted!");

    setClaimedNumbers((prev) => {
      const claimedValues = selectedCells
        .map((key) => {
          const [r, c] = key.split("-").map(Number);
          return ticket[r][c];
        })
        .filter((v) => typeof v === "number");

      return [...new Set([...prev, ...claimedValues])];
    });

    setSelectedCells([]);
  };

  if (!ticket) return null;

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
        {BINGO_LETTERS.map((l, i) => (
          <span
            key={l}
            className={`text-2xl font-extrabold ${
              claims > i ? "line-through text-emerald-400" : "text-zinc-500"
            }`}
          >
            {l}
          </span>
        ))}
      </div>

      <div className="flex flex-col items-start mt-4">
        <Ticket
          ticket={ticket}
          drawnNumbers={drawnNumbers}
          claimedNumbers={claimedNumbers}
          selectedCells={selectedCells}
          onCellToggle={(value, key) =>
            setSelectedCells((prev) =>
              prev.includes(key)
                ? prev.filter((k) => k !== key)
                : prev.length < 5
                ? [...prev, key]
                : prev
            )
          }
          onClaim={handleClaim}
        />
      </div>
    </div>
  );
};

export default Game;
