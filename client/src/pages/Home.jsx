import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { UserContext } from "../context/UserContext";
import { useSocketContext } from "../context/SocketContext";
import { FiRefreshCcw } from "react-icons/fi";

const Home = () => {
  const { user, logout } = useContext(UserContext);
  const { state: socketState, actions } = useSocketContext();
  const navigate = useNavigate();

  const [creatingRoom, setCreatingRoom] = useState(false);
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(false);

  const [roomIdInput, setRoomIdInput] = useState("");
  const [winnerLimitInput, setWinnerLimitInput] = useState("1");

  const isSocketConnected = socketState.connected;
  const isAuth = Boolean(user);
  const canUseSocket = isSocketConnected && isAuth;

  const handleCreateLobby = async () => {
    if (!user?._id) {
      toast.error("Please sign in to create a lobby.");
      return;
    }

    const cleanedRoomId = roomIdInput.trim() || Date.now().toString();

    const winnerLimit = Math.max(1, parseInt(winnerLimitInput) || 1);

    setCreatingRoom(true);
    const res = await actions.createRoom({
      roomId: cleanedRoomId,
      winnerLimit,
    });
    setCreatingRoom(false);

    if (!res.ok) {
      toast.error(res.error || "Failed to create room.");
      return;
    }

    toast.success("Room created!");
    navigate("/room", {
      state: {
        roomId: res.room?.id || cleanedRoomId,
        ticketIndex: res.ticketIndex,
      },
    });
  };

  const openJoinModal = () => {
    if (!canUseSocket) {
      toast.error("You must be online and signed in.");
      return;
    }
    setJoinModalOpen(true);
    setLoadingRooms(true);

    import("../components/socket").then(({ default: socket }) => {
      socket.emit("lobby:get_rooms", (roomsFromServer) => {
        setRooms(roomsFromServer || []);
        setLoadingRooms(false);
      });
    });
  };

  const closeJoinModal = () => {
    setJoinModalOpen(false);
    setRooms([]);
  };

  const handleJoinRoom = async (roomId) => {
    if (!user?._id) return;
    const res = await actions.joinRoom(roomId);
    if (!res.ok) {
      toast.error(res.error || "Failed to join room.");
      return;
    }
    toast.success(`Joined room #${res.room?.id || roomId}`);
    closeJoinModal();
    navigate("/room", {
      state: { roomId: res.room?.id || roomId, ticketIndex: res.ticketIndex },
    });
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-white flex flex-col px-4 py-6 sm:py-12">
      {/* Main Card - Responsive Width */}
      <div className="w-full max-w-lg mx-auto bg-zinc-800/90 border border-zinc-700 rounded-2xl p-5 sm:p-8 shadow-2xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-xs sm:text-sm text-zinc-400">
              Realtime Multiplayer Bingo
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold mt-1">
              {user
                ? `Hi, ${user?.fullName?.firstName || "Player"}!`
                : "Bingo Arena"}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Connection Status */}
            <div
              className={`flex items-center gap-2 p-2.5 rounded-full text-sm ${
                isSocketConnected
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                  : "bg-red-500/10 text-red-400 border border-red-500/30"
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  isSocketConnected ? "bg-emerald-400" : "bg-red-400"
                }`}
              />
              {isSocketConnected ? "Online" : "Offline"}
            </div>

            {/* Refresh Button */}
            <button
              onClick={() => window.location.reload()}
              className="p-2 rounded-full flex justify-center items-center gap-2 text-sm bg-zinc-700/50 border border-zinc-600 hover:bg-zinc-700 transition"
              aria-label="Refresh"
            >
              <FiRefreshCcw className="w-4 h-4" /> <span>Refresh</span>
            </button>
          </div>
        </div>

        <div className="my-6 h-px bg-zinc-700" />

        {/* Info Text */}
        <p className="text-sm text-zinc-300 leading-relaxed">
          Create a lobby or join friends to play live multiplayer bingo.
        </p>
        <p className="text-xs text-zinc-500 mt-2">
          Sign in + online status required to play.
        </p>

        {/* Lobby Settings - Only for logged-in users */}
        {user && (
          <div className="mt-6 bg-zinc-900/60 border border-zinc-700 rounded-xl p-4">
            <p className="text-xs text-zinc-400 mb-3">Lobby Options</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-zinc-400">
                  Room ID (optional)
                </label>
                <input
                  type="text"
                  value={roomIdInput}
                  onChange={(e) => setRoomIdInput(e.target.value)}
                  placeholder="e.g. 12345"
                  className="mt-1 w-full px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-sm focus:outline-none focus:border-emerald-500 transition"
                />
                <p className="text-[10px] text-zinc-500 mt-1">
                  Auto-generated if empty
                </p>
              </div>

              <div>
                <label className="text-xs text-zinc-400">Winners</label>
                <input
                  type="number"
                  min="1"
                  max="6"
                  value={winnerLimitInput}
                  onChange={(e) => setWinnerLimitInput(e.target.value)}
                  className="mt-1 w-full px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                />
                <p className="text-[10px] text-zinc-500 mt-1">
                  1–6 players can win
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {!user ? (
            <button
              onClick={() => navigate("/auth")}
              className="py-3.5 px-6 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-black font-bold rounded-xl transition text-sm sm:text-base"
            >
              Sign in to Play
            </button>
          ) : (
            <>
              <button
                onClick={async () => {
                  await logout();
                  toast.info("Logged out");
                }}
                className="py-3.5 px-6 bg-zinc-700 hover:bg-zinc-600 active:bg-zinc-500 text-white font-medium rounded-xl transition text-sm"
              >
                Logout
              </button>

              <button
                onClick={handleCreateLobby}
                disabled={!canUseSocket || creatingRoom}
                className={`py-3.5 px-6 font-bold rounded-xl transition text-sm ${
                  !canUseSocket || creatingRoom
                    ? "bg-green-800/50 text-green-300 cursor-not-allowed"
                    : "bg-green-500 hover:bg-green-600 active:bg-green-700 text-white"
                }`}
              >
                {creatingRoom ? "Creating..." : "Create Lobby"}
              </button>

              <button
                onClick={openJoinModal}
                disabled={!canUseSocket}
                className={`py-3.5 px-6 font-bold rounded-xl transition text-sm ${
                  !canUseSocket
                    ? "bg-blue-800/50 text-blue-300 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white"
                }`}
              >
                Join Room
              </button>
            </>
          )}
        </div>

        {!user && (
          <p className="text-center text-xs text-zinc-500 mt-4">
            You need to sign in to play
          </p>
        )}
      </div>

      {joinModalOpen && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50"
          onClick={closeJoinModal}
        >
          <div
            className="w-full max-w-md bg-zinc-900 border border-zinc-700 rounded-2xl p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold">Join a Room</h2>
              <button
                onClick={closeJoinModal}
                className="text-zinc-400 hover:text-white text-2xl leading-none"
              >
                ×
              </button>
            </div>

            {loadingRooms ? (
              <p className="text-center text-zinc-400 py-8">Loading rooms...</p>
            ) : rooms.length === 0 ? (
              <p className="text-center text-zinc-500 py-8">
                No open rooms right now.
              </p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {rooms.map((room) => (
                  <div
                    key={room.id}
                    className="flex justify-between items-center bg-zinc-800/70 border border-zinc-700 rounded-lg p-4"
                  >
                    <div>
                      <p className="font-semibold">Room #{room.id}</p>
                      <p className="text-xs text-zinc-400 capitalize">
                        {room.status === "pending" && "Waiting"}
                        {room.status === "ongoing" && "In Progress"}
                        {room.status === "finished" && "Finished"}
                      </p>
                    </div>
                    <button
                      onClick={() => handleJoinRoom(room.id)}
                      disabled={room.status !== "pending"}
                      className={`px-5 py-2 rounded-lg font-medium text-sm transition ${
                        room.status !== "pending"
                          ? "bg-zinc-700 text-zinc-500 cursor-not-allowed"
                          : "bg-blue-500 hover:bg-blue-600 text-white"
                      }`}
                    >
                      {room.status === "pending" ? "Join" : "Full"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
