import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Trophy, Home, Medal, User } from "lucide-react";

const Leaderboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const winners = location.state?.data || [];
  const sortedData = [...winners].sort((a, b) => a.rank - b.rank);

  return (
    <div className="min-h-screen bg-zinc-900 text-white p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-2xl">
        <div className="flex flex-col items-center mb-12">
          <div className="bg-orange-500/10 p-4 rounded-full mb-4">
            <Trophy className="text-orange-500 w-12 h-12" />
          </div>
          <h1 className="text-5xl font-black uppercase tracking-tighter italic text-white">
            Leaderboard
          </h1>
          <p className="text-zinc-500 font-medium tracking-widest uppercase text-xs mt-2">
            Final Match Results
          </p>
        </div>

        <div className="space-y-3 mb-10">
          {sortedData.length > 0 ? (
            sortedData.map((user) => (
              <div
                key={user.userId}
                className={`flex items-center p-1 rounded-2xl transition-all ${
                  user.rank === 1
                    ? "bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg shadow-orange-500/20 scale-[1.02]"
                    : "bg-zinc-800 border border-zinc-700"
                }`}
              >
                <div
                  className={`flex items-center justify-center w-14 h-14 rounded-xl font-black text-xl ${
                    user.rank === 1
                      ? "bg-white/20 text-white"
                      : "bg-zinc-700 text-zinc-400"
                  }`}
                >
                  {user.rank === 1 ? <Medal size={28} /> : `#${user.rank}`}
                </div>

                <div className="flex-1 px-4">
                  <h3 className="font-bold text-lg leading-tight uppercase tracking-tight">
                    {user.name}
                  </h3>
                  <p
                    className={`text-xs font-mono ${
                      user.rank === 1 ? "text-orange-100" : "text-zinc-500"
                    }`}
                  >
                    ID: {user.userId.slice(-6).toUpperCase()}
                  </p>
                </div>

                {user.rank === 1 && (
                  <div className="pr-6">
                    <div className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                      Winner
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="bg-zinc-800 border border-zinc-700 border-dashed rounded-3xl p-12 text-center">
              <User className="mx-auto text-zinc-600 mb-4" size={40} />
              <p className="text-zinc-500 font-bold uppercase tracking-widest text-sm">
                No Winner Data Found
              </p>
            </div>
          )}
        </div>

        <button
          onClick={() => navigate("/home")}
          className="group flex items-center justify-center gap-3 w-full py-5 bg-white hover:bg-orange-500 text-zinc-900 hover:text-white font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl active:scale-95"
        >
          <Home
            size={20}
            className="group-hover:-translate-y-1 transition-transform"
          />
          Exit to Lobby
        </button>
      </div>
    </div>
  );
};

export default Leaderboard;
