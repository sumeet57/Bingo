import React from "react";

const Ticket = ({
  ticket,
  drawnNumbers,
  claimedNumbers,
  selectedCells,
  onCellToggle,
  onClaim,
}) => {
  const middleIndex = 2;

  const isDrawn = (v) => typeof v === "number" && drawnNumbers.includes(v);
  const isClaimed = (v) => typeof v === "number" && claimedNumbers.includes(v);

  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-2xl p-4 shadow-lg">
      <h2 className="text-lg font-semibold mb-3 text-center">Your Ticket</h2>

      <div className="grid grid-cols-5 gap-2">
        {ticket.map((row, r) =>
          row.map((value, c) => {
            const key = `${r}-${c}`;
            const isFree = r === middleIndex && c === middleIndex;
            const selected = selectedCells.includes(key);

            let cls =
              "w-12 h-12 flex items-center justify-center rounded-md text-sm font-semibold border transition-all";

            // 🎯 PRIORITY: FREE > CLAIMED > DRAWN > DEFAULT
            if (isFree) {
              cls += " bg-purple-500/40 border-purple-400 text-white";
            } else if (isClaimed(value)) {
              cls +=
                " bg-emerald-600 border-emerald-300 text-white shadow-inner";
            } else if (isDrawn(value)) {
              cls += " bg-emerald-500/30 border-emerald-400 text-emerald-100";
            } else {
              cls += " bg-zinc-700 border-zinc-600 text-zinc-200";
            }

            if (selected) {
              cls +=
                " ring-2 ring-yellow-400 ring-offset-1 ring-offset-zinc-800";
            }

            return (
              <button
                key={key}
                onClick={() => onCellToggle(value, key)}
                className={cls}
              >
                {isFree ? "★" : value}
              </button>
            );
          })
        )}
      </div>

      <button
        onClick={onClaim}
        disabled={selectedCells.length !== 5}
        className="mt-4 w-full py-2 rounded-md font-semibold transition
          bg-blue-500 hover:bg-blue-600 active:bg-blue-700
          disabled:bg-zinc-600 disabled:cursor-not-allowed"
      >
        Claim Pattern
      </button>
    </div>
  );
};

export default Ticket;
