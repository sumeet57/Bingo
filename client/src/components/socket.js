import { io } from "socket.io-client";
const SERVER_URL = import.meta.env.VITE_BACKEND_URL;
const socket = io(SERVER_URL);

// test
socket.on("connect", () => console.log("Connected:", socket.id));

export default socket;
