export const lobbyEvents = (io, socket) => {
  socket.on("lobby:create", (data) => {
    console.log("Lobby create event received with data:", data);
  });
};
