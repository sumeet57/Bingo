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

  useEffect(() => {
    if (socketState.connected) {
      console.log("Socket connected in Home");
    }
  }, [socketState.connected]);

  const handleCreateLobby = async () => {
    if (!user?._id) {
      toast.error("Please sign in to create a lobby.");
      return;
    }

    const cleanedRoomId =
      roomIdInput && roomIdInput.toString().trim().length > 0
        ? roomIdInput.toString().trim()
        : Date.now().toString();

    const winnerLimitNumber = Number(winnerLimitInput);
    const winnerLimit =
      Number.isNaN(winnerLimitNumber) || winnerLimitNumber <= 0
        ? 1
        : winnerLimitNumber;

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
      toast.error("You must be online and signed in to join rooms.");
      return;
    }
    setJoinModalOpen(true);
    setLoadingRooms(true);

    // Use raw socket via context's socketState / direct import is fine if you kept it.
    // Assuming you still import socket in this file earlier; if not, move this logic into context.
    import("../components/socket").then(({ default: socket }) => {
      socket.emit("lobby:get_rooms", (roomsFromServer) => {
        console.log("Rooms list:", roomsFromServer);
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
    if (!user?._id) {
      toast.error("Please sign in to join a lobby.");
      return;
    }

    const res = await actions.joinRoom(roomId);
    if (!res.ok) {
      toast.error(res.error || "Failed to join room.");
      return;
    }

    toast.success(`Joined room #${res.room?.id || roomId}`);
    closeJoinModal();
    navigate("/room", {
      state: {
        roomId: res.room?.id || roomId,
        ticketIndex: res.ticketIndex,
      },
    });
  };

  return (
    <div className="min-h-screen w-full bg-zinc-900 text-white flex items-center justify-center px-4">
      <div className="w-full max-w-xl bg-zinc-800/80 border border-zinc-700 rounded-2xl p-8 shadow-xl flex flex-col gap-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-zinc-400">Realtime Multiplayer Bingo</p>
            <h1 className="text-2xl sm:text-3xl font-bold">
              {user
                ? `Welcome, ${user?.fullName?.firstName || "Player"}!`
                : "Welcome to Bingo Arena"}
            </h1>
          </div>
          <div className="flex gap-2">
            <div
              className={`flex items-center gap-2 text-sm px-3 py-1 rounded-full ${
                isSocketConnected
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/40"
                  : "bg-red-500/10 text-red-400 border border-red-500/40"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isSocketConnected ? "bg-emerald-400" : "bg-red-400"
                }`}
              />
              <span>{isSocketConnected ? "Online" : "Offline"}</span>
            </div>
            <button
              onClick={() => {
                window.location.reload();
              }}
              className="flex items-center gap-2 text-sm px-3 py-1 rounded-full bg-zinc-700/40 border border-zinc-600"
            >
              <FiRefreshCcw />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        <div className="h-px bg-zinc-700/70" />

        <div className="space-y-2">
          <p className="text-sm text-zinc-300">
            Create a lobby or join an existing one to play Bingo in realtime.
          </p>
          <p className="text-xs text-zinc-500">
            You must be signed in and connected to the server to start or join
            games.
          </p>
        </div>

        {user && (
          <div className="bg-zinc-900/60 border border-zinc-700 rounded-xl p-4 space-y-3 mt-1">
            <p className="text-xs text-zinc-400 mb-1">
              Lobby Settings (for Create Lobby)
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 flex flex-col gap-1">
                <label className="text-xs text-zinc-400">Room ID</label>
                <input
                  type="text"
                  value={roomIdInput}
                  onChange={(e) => setRoomIdInput(e.target.value)}
                  placeholder="e.g. 12345"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm outline-none focus:border-emerald-500"
                />
                <span className="text-[10px] text-zinc-500">
                  Leave empty to auto-generate.
                </span>
              </div>
              <div className="w-full sm:w-28 flex flex-col gap-1">
                <label className="text-xs text-zinc-400">
                  Number of Winners
                </label>
                <input
                  type="number"
                  min={1}
                  max={6}
                  value={winnerLimitInput}
                  onChange={(e) => setWinnerLimitInput(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm outline-none focus:border-emerald-500"
                />
                <span className="text-[10px] text-zinc-500">
                  Must be at least 1.
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 mt-2">
          {!user && (
            <button
              className="flex-1 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-black font-semibold py-3 rounded-lg transition-colors"
              onClick={() => navigate("/auth")}
            >
              Sign in to Play
            </button>
          )}

          {user && (
            <>
              <button
                className="flex-1 bg-red-500 hover:bg-red-600 active:bg-red-700 text-white font-semibold py-3 rounded-lg transition-colors"
                onClick={async () => {
                  await logout();
                  toast.info("Logged out.");
                }}
              >
                Logout
              </button>

              <button
                className={`flex-1 font-semibold py-3 rounded-lg transition-colors ${
                  !canUseSocket || creatingRoom
                    ? "bg-green-700/40 text-green-300/60 cursor-not-allowed"
                    : "bg-green-500 hover:bg-green-600 active:bg-green-700 text-white"
                }`}
                disabled={!canUseSocket || creatingRoom}
                onClick={handleCreateLobby}
              >
                {creatingRoom ? "Creating Lobby..." : "Create Lobby"}
              </button>

              <button
                className={`flex-1 font-semibold py-3 rounded-lg transition-colors ${
                  !canUseSocket
                    ? "bg-blue-700/40 text-blue-300/60 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white"
                }`}
                disabled={!canUseSocket}
                onClick={openJoinModal}
              >
                Join Room
              </button>
            </>
          )}
        </div>

        {!user && (
          <p className="text-xs text-zinc-500 mt-1">
            You need to sign in to create or join a lobby.
          </p>
        )}
      </div>

      {joinModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-700 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Available Rooms</h2>
              <button
                className="text-zinc-400 hover:text-white text-sm"
                onClick={closeJoinModal}
              >
                Close
              </button>
            </div>

            {loadingRooms ? (
              <p className="text-sm text-zinc-400">Loading rooms...</p>
            ) : rooms.length === 0 ? (
              <p className="text-sm text-zinc-400">No rooms available.</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {rooms.map((room) => (
                  <div
                    key={room.id}
                    className="flex items-center justify-between bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2"
                  >
                    <div>
                      <p className="font-medium">Room #{room.id}</p>
                      <p className="text-xs text-zinc-400">
                        Status:{" "}
                        <span
                          className={
                            room.status === "pending"
                              ? "text-yellow-400"
                              : room.status === "ongoing"
                              ? "text-green-400"
                              : "text-red-400"
                          }
                        >
                          {room.status}
                        </span>
                      </p>
                    </div>
                    <button
                      className="text-sm bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white px-3 py-1.5 rounded-md"
                      onClick={() => handleJoinRoom(room.id)}
                    >
                      Join
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
