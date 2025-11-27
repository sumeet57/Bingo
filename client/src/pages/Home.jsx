import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import socket from "../components/socket";

const Home = () => {
  const { user, logout } = useContext(UserContext);
  const navigate = useNavigate();

  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [creatingRoom, setCreatingRoom] = useState(false);

  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(false);

  useEffect(() => {
    const handleConnect = () => {
      console.log("Socket connected in Home component:", socket.id);
      setIsSocketConnected(true);
    };

    const handleDisconnect = () => {
      console.log("Socket disconnected in Home component");
      setIsSocketConnected(false);
    };

    const handleRoomUpdated = (data) => {
      console.log("Room updated:", data);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("room:updated", handleRoomUpdated);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("room:updated", handleRoomUpdated);
    };
  }, []);

  const handleCreateLobby = () => {
    if (!user?._id) return;

    setCreatingRoom(true);

    socket.emit(
      "room:create",
      {
        hostUserId: user._id,
        hostName: user?.fullName?.firstName || "Host",
        winnerLimit: 2,
        roomId: 12345, // later you can randomize or input roomId
      },
      (response) => {
        console.log("Create room response:", response);
        setCreatingRoom(false);

        if (!response || !response.ok) {
          console.error("Room create failed:", response?.error);
          return;
        }

        navigate("/room", {
          state: {
            roomId: response.room?.id || 12345,
            ticketIndex: response.ticketIndex,
          },
        });
      }
    );
  };

  const openJoinModal = () => {
    setJoinModalOpen(true);
    setLoadingRooms(true);

    socket.emit("lobby:get_rooms", (roomsFromServer) => {
      console.log("Rooms list:", roomsFromServer);
      setRooms(roomsFromServer || []);
      setLoadingRooms(false);
    });
  };

  const closeJoinModal = () => {
    setJoinModalOpen(false);
    setRooms([]);
  };

  const handleJoinRoom = (roomId) => {
    if (!user?._id) return;

    socket.emit(
      "room:join",
      {
        roomId,
        userId: user._id,
        name: user?.fullName?.firstName || "Player",
      },
      (response) => {
        console.log("Join room response:", response);

        if (!response || !response.ok) {
          console.error("Join room failed:", response?.error);
          return;
        }

        closeJoinModal();

        navigate("/room", {
          state: {
            roomId: response.room?.id || roomId,
            ticketIndex: response.ticketIndex,
          },
        });
      }
    );
  };

  const isAuth = Boolean(user);
  const canUseSocket = isSocketConnected && isAuth;

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
          <div
            className={`flex items-center gap-2 text-xs px-3 py-1 rounded-full ${
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
