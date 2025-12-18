import { useContext, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { UserContext } from "../context/UserContext";
import { useSocketContext } from "../context/SocketContext";

const Room = () => {
  const { user } = useContext(UserContext);
  const { state, actions } = useSocketContext();
  const { players, isHost, roomId: ctxRoomId } = state;

  const navigate = useNavigate();
  const { state: navState } = useLocation();

  const roomId = ctxRoomId || navState?.roomId;
  const ticketIndex = state.ticketIndex ?? navState?.ticketIndex;

  useEffect(() => {
    if (!user?._id || !roomId) {
      toast.error("No room joined.");
      navigate("/");
    }
  }, [user?._id, roomId, navigate]);

  useEffect(() => {
    const onGameStarted = () => {
      navigate("/game", {
        state: { roomId, ticketIndex },
      });
    };

    window.addEventListener("bingo-start", onGameStarted);
    return () => window.removeEventListener("bingo-start", onGameStarted);
  }, [navigate, roomId, ticketIndex]);

  const handleStartGame = async () => {
    await actions.startGame();
  };

  return (
    <div className="min-h-screen w-full bg-zinc-900 text-white flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold mt-4">Room #{roomId}</h1>
      <p className="text-sm text-zinc-400">Your Ticket Index: {ticketIndex}</p>

      <div className="w-full max-w-2xl bg-zinc-800 mt-6 p-5 rounded-xl border border-zinc-700 shadow-md">
        <h2 className="text-xl font-semibold mb-3">Players in Room</h2>

        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {players.map((p) => (
            <div
              key={p.userId}
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

      {isHost && (
        <button
          className="mt-6 px-6 py-3 font-semibold rounded-md bg-green-500 hover:bg-green-600 transition"
          onClick={handleStartGame}
        >
          Start Game
        </button>
      )}
    </div>
  );
};

export default Room;
