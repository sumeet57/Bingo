import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { UserContext } from "../context/UserContext";
import { useSocketContext } from "../context/SocketContext";
import { FiRefreshCcw } from "react-icons/fi";
import socket from "../components/socket";

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

    if (!res?.ok) {
      toast.error(res?.error || "Failed to create room.");
      return;
    }

    toast.success("Room created!");
    navigate("/room", {
      state: {
        roomId: cleanedRoomId,
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

    socket.emit("lobby:get_rooms", (roomsFromServer) => {
      setRooms(roomsFromServer || []);
      setLoadingRooms(false);
    });
  };

  const closeJoinModal = () => {
    setJoinModalOpen(false);
    setRooms([]);
  };

  const handleJoinRoom = async (roomId) => {
    if (!user?._id) return;

    const res = await actions.joinRoom(roomId);
    if (!res?.ok) {
      toast.error(res?.error || "Failed to join room.");
      return;
    }

    toast.success(`Joined room #${roomId}`);
    closeJoinModal();

    navigate("/room", {
      state: {
        roomId,
        ticketIndex: res.ticketIndex,
      },
    });
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-white flex flex-col px-4 py-6 sm:py-12">
      <div className="w-full max-w-lg mx-auto bg-zinc-800/90 border border-zinc-700 rounded-2xl p-5 sm:p-8 shadow-2xl">
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

            <button
              onClick={() => window.location.reload()}
              className="p-2 rounded-full flex justify-center items-center gap-2 text-sm bg-zinc-700/50 border border-zinc-600 hover:bg-zinc-700 transition"
            >
              <FiRefreshCcw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        <div className="my-6 h-px bg-zinc-700" />

        {user && (
          <div className="mt-6 bg-zinc-900/60 border border-zinc-700 rounded-xl p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                value={roomIdInput}
                onChange={(e) => setRoomIdInput(e.target.value)}
                placeholder="Room ID (optional)"
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-lg"
              />
              <input
                type="number"
                min="1"
                max="6"
                value={winnerLimitInput}
                onChange={(e) => setWinnerLimitInput(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-lg"
              />
            </div>
          </div>
        )}

        <div className="mt-8 grid gap-3">
          {!user ? (
            <button
              onClick={() => navigate("/auth")}
              className="py-3.5 bg-amber-500 text-black font-bold rounded-xl"
            >
              Sign in to Play
            </button>
          ) : (
            <>
              <button
                onClick={logout}
                className="py-3.5 bg-zinc-700 rounded-xl"
              >
                Logout
              </button>

              <button
                onClick={handleCreateLobby}
                disabled={!canUseSocket || creatingRoom}
                className={`py-3.5 font-bold rounded-xl ${
                  !canUseSocket || creatingRoom
                    ? "bg-green-800/50 cursor-not-allowed"
                    : "bg-green-500 hover:bg-green-600"
                }`}
              >
                {creatingRoom ? "Creating..." : "Create Lobby"}
              </button>

              <button
                onClick={openJoinModal}
                disabled={!canUseSocket}
                className={`py-3.5 font-bold rounded-xl ${
                  !canUseSocket
                    ? "bg-blue-800/50 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600"
                }`}
              >
                Join Room
              </button>
            </>
          )}
        </div>
      </div>

      {joinModalOpen && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center"
          onClick={closeJoinModal}
        >
          <div
            className="bg-zinc-900 p-6 rounded-xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            {loadingRooms ? (
              <p className="text-center">Loading rooms...</p>
            ) : (
              rooms.map((room) => (
                <div
                  key={room.id}
                  className="flex justify-between items-center p-3 bg-zinc-800 rounded mb-2"
                >
                  <span>Room #{room.id}</span>
                  <button
                    onClick={() => handleJoinRoom(room.id)}
                    className="bg-blue-500 px-4 py-1 rounded"
                  >
                    Join
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
