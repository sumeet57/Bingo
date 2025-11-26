import React from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import socket from "../components/socket";
import { useEffect } from "react";

const Home = () => {
  useEffect(() => {
    socket.on("connect", () => {
      console.log("Socket connected in Home component:", socket.id);
    });

    return () => {
      socket.off("connect");
    };
  }, []);
  const { user, logout } = React.useContext(UserContext);
  const navigate = useNavigate();
  return (
    <>
      <div className="w-fulll h-screen bg-zinc-900 text-white flex justify-center items-center gap-3 flex-col">
        <h1 className="text-4xl font-bold">
          Welcome to Home Page - {user?.fullName?.firstName}
        </h1>
        <button
          className={`bg-amber-500 p-4 uppercase rounded-lg ${
            user == null ? "" : "hidden"
          }`}
          onClick={() => navigate("/auth")}
        >
          Sign in
        </button>
        <button
          className={`bg-red-500 p-4 uppercase rounded-lg ${
            user == null ? "hidden" : ""
          }`}
          onClick={async () => {
            await logout();
          }}
        >
          logout
        </button>

        <button
          className=" bg-green-500 p-4 uppercase rounded-lg"
          onClick={() => {
            socket.emit("lobby:create", { createdBy: user?._id || "guest" });
          }}
        >
          Create Lobby
        </button>
      </div>
    </>
  );
};

export default Home;
