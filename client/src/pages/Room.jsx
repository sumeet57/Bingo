import { useContext, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { UserContext } from "../context/UserContext";
import { useSocketContext } from "../context/SocketContext";

const Room = () => {
  const { user } = useContext(UserContext);
  const { state, actions } = useSocketContext();
  const { room, players, isHost } = state;

  const navigate = useNavigate();
  const { state: navState } = useLocation();

  const fallbackRoomId = navState?.roomId;
  const fallbackTicketIndex = navState?.ticketIndex;

  useEffect(() => {
    if (!user?._id) {
      toast.error("Please sign in.");
      navigate("/");
      return;
    }

    if (!room && !fallbackRoomId) {
      toast.error("No room joined.");
      navigate("/");
      return;
    }
  }, [user?._id, room, fallbackRoomId, navigate]);

  useEffect(() => {
    if (room?.status === "ongoing" && room?.id) {
      navigate("/game", {
        state: {
          roomId: room.id,
          ticketIndex: state.ticketIndex ?? fallbackTicketIndex,
          isHost,
        },
      });
    }
  }, [
    room?.status,
    room?.id,
    isHost,
    state.ticketIndex,
    fallbackTicketIndex,
    navigate,
  ]);

  const handleStartGame = async () => {
    const res = await actions.startGame();
    if (!res.ok) {
      toast.error(res.error || "Failed to start game.");
      return;
    }
    toast.success("Game starting...");
  };

  const derivedRoomId = room?.id || fallbackRoomId;
  const derivedTicketIndex = state.ticketIndex ?? fallbackTicketIndex;
  const gameStatus = room?.status || "pending";

  return (
    <div className="min-h-screen w-full bg-zinc-900 text-white flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold mt-4">Room #{derivedRoomId}</h1>
      <p className="text-sm text-zinc-400">
        Your Ticket Index: {derivedTicketIndex}
      </p>
      <p className="text-xs mt-1">
        Status:{" "}
        <span
          className={
            gameStatus === "pending"
              ? "text-yellow-400"
              : gameStatus === "ongoing"
              ? "text-green-400"
              : "text-red-400"
          }
        >
          {gameStatus}
        </span>
      </p>

      <div className="w-full max-w-2xl bg-zinc-800 mt-6 p-5 rounded-xl border border-zinc-700 shadow-md">
        <h2 className="text-xl font-semibold mb-3">Players in Room</h2>

        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {players.map((p, i) => (
            <div
              key={i}
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

      {isHost && gameStatus === "pending" && (
        <button
          className="mt-6 px-6 py-3 font-semibold rounded-md bg-green-500 hover:bg-green-600 active:bg-green-700 transition"
          onClick={handleStartGame}
        >
          Start Game
        </button>
      )}

      {gameStatus === "ongoing" && (
        <p className="text-green-400 font-semibold mt-6 text-lg">
          Game is live — redirecting to board...
        </p>
      )}
    </div>
  );
};

export default Room;
