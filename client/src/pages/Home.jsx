import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { UserContext } from "../context/UserContext";
import { useSocketContext } from "../context/SocketContext";
import { FiRefreshCcw, FiPlus, FiUsers, FiSearch } from "react-icons/fi";
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
      <div className="w-full max-w-lg mx-auto bg-zinc-800/90 border border-zinc-700 rounded-3xl p-6 sm:p-10 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex-1">
            <p className="text-xs sm:text-sm font-bold text-orange-500 uppercase tracking-widest">
              Realtime Multiplayer Bingo
            </p>
            <h1 className="text-3xl sm:text-4xl font-black mt-1 italic tracking-tighter">
              {user
                ? `HI, ${user?.fullName?.firstName.toUpperCase()}!`
                : "BINGO ARENA"}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter border ${
                isSocketConnected
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                  : "bg-red-500/10 text-red-400 border-red-500/30"
              }`}
            >
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  isSocketConnected
                    ? "bg-emerald-400 animate-pulse"
                    : "bg-red-400"
                }`}
              />
              {isSocketConnected ? "Online" : "Offline"}
            </div>

            <button
              onClick={() => window.location.reload()}
              className="p-2 rounded-xl bg-zinc-700/50 border border-zinc-600 hover:bg-zinc-700 transition active:scale-90"
            >
              <FiRefreshCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="my-8 h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />

        {user && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">
                  Room Identity
                </label>
                <input
                  value={roomIdInput}
                  onChange={(e) => setRoomIdInput(e.target.value)}
                  placeholder="Ex: Party-Room"
                  className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-xl focus:border-orange-500 outline-none transition"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">
                  Max Winners
                </label>
                <input
                  type="number"
                  min="1"
                  max="6"
                  value={winnerLimitInput}
                  onChange={(e) => setWinnerLimitInput(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-xl focus:border-orange-500 outline-none transition font-bold text-orange-500"
                />
              </div>
            </div>
          </div>
        )}

        <div className="mt-10 flex flex-col gap-4">
          {!user ? (
            <button
              onClick={() => navigate("/auth")}
              className="py-4 bg-orange-500 hover:bg-orange-600 text-white font-black uppercase tracking-widest rounded-2xl transition shadow-lg shadow-orange-500/20 active:scale-[0.98]"
            >
              Sign in to Play
            </button>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4">
                <button
                  onClick={handleCreateLobby}
                  disabled={!canUseSocket || creatingRoom}
                  className={`flex  items-center justify-center gap-2 py-4 rounded-2xl font-black uppercase text-sm tracking-widest transition shadow-xl ${
                    !canUseSocket || creatingRoom
                      ? "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                      : "bg-emerald-500 hover:bg-emerald-600 text-white active:scale-95"
                  }`}
                >
                  <FiPlus size={24} />
                  {creatingRoom ? "Wait..." : "Create"}
                </button>

                <button
                  onClick={openJoinModal}
                  disabled={!canUseSocket}
                  className={`flex  items-center justify-center gap-2 py-4 rounded-2xl font-black uppercase text-sm tracking-widest transition shadow-xl ${
                    !canUseSocket
                      ? "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                      : "bg-blue-500 hover:bg-blue-600 text-white active:scale-95"
                  }`}
                >
                  <FiSearch size={24} />
                  Join
                </button>
              </div>

              <button
                onClick={logout}
                className="mt-2 py-4 border border-zinc-700 text-zinc-500 hover:text-white hover:border-zinc-500 font-bold uppercase text-xs tracking-widest rounded-2xl transition"
              >
                Sign Out
              </button>
            </>
          )}
        </div>
      </div>

      {joinModalOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={closeJoinModal}
        >
          <div
            className="bg-zinc-800 border border-zinc-700 p-8 rounded-3xl w-full max-w-md shadow-2xl transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black uppercase tracking-widest">
                Active Rooms
              </h2>
              <button
                onClick={closeJoinModal}
                className="text-zinc-500 hover:text-white font-bold"
              >
                Close
              </button>
            </div>

            <div className="max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
              {loadingRooms ? (
                <div className="flex flex-col items-center py-10 text-zinc-500">
                  <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="font-bold uppercase text-xs">
                    Scanning Network...
                  </p>
                </div>
              ) : rooms.length > 0 ? (
                <div className="grid gap-3">
                  {rooms.map((room) => (
                    <div
                      key={room.id}
                      className="flex justify-between items-center p-4 bg-zinc-900 border border-zinc-700 rounded-2xl hover:border-blue-500 transition-colors group"
                    >
                      <div>
                        <span className="block text-xs font-black text-zinc-500 uppercase tracking-widest">
                          Room ID
                        </span>
                        <span className="font-bold text-lg text-white">
                          #{room.id}
                        </span>
                      </div>
                      <button
                        onClick={() => handleJoinRoom(room.id)}
                        className="bg-blue-500 hover:bg-blue-600 px-6 py-2 rounded-xl font-black uppercase text-xs tracking-widest transition active:scale-95"
                      >
                        Join
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center py-12 text-center">
                  <div className="bg-zinc-700/30 p-5 rounded-full mb-4">
                    <FiUsers size={32} className="text-zinc-600" />
                  </div>
                  <p className="text-zinc-400 font-bold uppercase tracking-widest text-sm">
                    No Active Rooms
                  </p>
                  <p className="text-zinc-600 text-xs mt-1 px-10">
                    Try creating a lobby to start playing with others!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
