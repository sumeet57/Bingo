// src/components/bingo/DrawnNumbers.jsx
import React, { useState } from "react";

const ALL_NUMBERS = Array.from({ length: 99 }, (_, i) => i + 1);

const DrawnNumbers = ({ drawnNumbers, isHost, onCallNext }) => {
  const [showAllModal, setShowAllModal] = useState(false);

  const latestNumber =
    drawnNumbers.length > 0 ? drawnNumbers[drawnNumbers.length - 1] : null;

  return (
    <>
      <div className="w-full max-w-xl mt-3 mb-4 space-y-3">
        {isHost && (
          <button
            onClick={onCallNext}
            className="w-full py-3 rounded-xl font-semibold bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transition border border-blue-400/60"
          >
            Pick Number
          </button>
        )}

        <div className="bg-gradient-to-r from-pink-500/40 via-purple-500/30 to-blue-500/40 rounded-2xl  p-3 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wide text-zinc-100/80">
              Drawn Numbers
            </span>

            {drawnNumbers.length > 0 && (
              <button
                onClick={() => setShowAllModal(true)}
                className="text-xs text-zinc-100/90 hover:text-white underline"
              >
                View All
              </button>
            )}
          </div>

          <div className="flex flex-row-reverse justify-end gap-2 overflow-x-auto pb-1">
            {drawnNumbers.length === 0 ? (
              <span className="text-xs text-zinc-100/80">
                No numbers drawn yet.
              </span>
            ) : (
              drawnNumbers.map((n, index) => {
                const isLatest = n === latestNumber;
                return (
                  <button
                    key={n}
                    onClick={() => setShowAllModal(true)}
                    className={`shrink-0 w-10 h-10 rounded-full flex items-center flex-row-reverse justify-center text-sm font-semibold border transition ${
                      isLatest
                        ? "bg-pink-500 text-white border-pink-300"
                        : "bg-zinc-100 text-zinc-800 border-zinc-300"
                    }`}
                  >
                    {n}
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      {showAllModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="w-full max-w-lg bg-zinc-900 border border-zinc-700 rounded-2xl p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">All Numbers</h2>
              <button
                className="text-sm text-zinc-400 hover:text-white"
                onClick={() => setShowAllModal(false)}
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-10 gap-2 max-h-80 overflow-y-auto mt-2">
              {ALL_NUMBERS.map((num) => {
                const isDrawn = drawnNumbers.includes(num);
                return (
                  <div
                    key={num}
                    className={`w-8 h-8 flex items-center justify-center rounded-md text-xs font-semibold border ${
                      isDrawn
                        ? "bg-emerald-500/70 border-emerald-300 text-white"
                        : "bg-zinc-800 border-zinc-700 text-zinc-300"
                    }`}
                  >
                    {num}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DrawnNumbers;
