import { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { UserContext } from "../context/UserContext";
import { useSocketContext } from "../context/SocketContext";
import socket from "../components/socket";
import Ticket from "../components/Ticket";
import DrawnNumbers from "../components/DrawnNumbers";

const GRID_SIZE = 5;
const BINGO_LETTERS = "BINGO".split("");

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

  const [selectedCells, setSelectedCells] = useState([]); // ["r-c", ...]
  const [claimedNumbers, setClaimedNumbers] = useState([]); // for UI only

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
    }
  };

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

    // 4 numbers if line has FREE, 5 if it doesn't
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

  return (
    <div className="min-h-screen w-full bg-zinc-900 text-white flex flex-col items-center p-6">
      <p className="text-sm text-zinc-400">
        Room #{roomId} · Ticket #{ticketIndexFromNav}
      </p>

      <DrawnNumbers
        drawnNumbers={drawnNumbers}
        isHost={isHost}
        onCallNext={handleCallNumber}
      />

      <div className="flex items-center gap-2">
        {BINGO_LETTERS.map((letter, i) => (
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

      <div className="flex flex-col items-start mt-4">
        <Ticket
          ticket={ticket}
          loading={loadingTicket}
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
