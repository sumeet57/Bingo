// src/components/bingo/Ticket.jsx
import React from "react";

const Ticket = ({
  ticket,
  loading,
  drawnNumbers,
  claimedNumbers,
  selectedCells,
  onCellToggle,
  onClaim,
}) => {
  const gridSize = ticket?.length || 5;
  const middleIndex = Math.floor(gridSize / 2);

  const isNumberDrawn = (value) =>
    typeof value === "number" && drawnNumbers.includes(value);

  const isNumberClaimed = (value) =>
    typeof value === "number" && claimedNumbers.includes(value);

  const isCellSelected = (key) => selectedCells.includes(key);

  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-2xl p-4 shadow-lg">
      <h2 className="text-lg font-semibold mb-3 text-center">Your Ticket</h2>

      {loading ? (
        <p className="text-sm text-zinc-400">Loading ticket...</p>
      ) : ticket ? (
        <div className="grid grid-cols-5 gap-2">
          {ticket.map((row, rIdx) =>
            row.map((value, cIdx) => {
              const key = `${rIdx}-${cIdx}`;

              const isFreeCell = rIdx === middleIndex && cIdx === middleIndex;
              const drawn = isNumberDrawn(value);
              const claimed = isNumberClaimed(value);
              const selected = isCellSelected(key);

              let baseClasses =
                "w-12 h-12 flex items-center justify-center rounded-md text-sm font-semibold border transition-all";

              if (isFreeCell) {
                baseClasses += " bg-purple-500/40 border-purple-400 text-white";
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
                  onClick={() => onCellToggle(value, key)}
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
        onClick={onClaim}
        className="mt-4 w-full py-2 rounded-md font-semibold transition bg-blue-500 hover:bg-blue-600 active:bg-blue-700"
      >
        Claim Pattern
      </button>
    </div>
  );
};

export default Ticket;
