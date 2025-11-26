import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

// test
socket.on("connect", () => console.log("Connected:", socket.id));

export default socket;
