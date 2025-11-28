import React, { useContext } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Auth from "./pages/Auth";
import Home from "./pages/Home";
import Room from "./pages/Room";
import Game from "./pages/Game";
import { UserContext, UserContextProvider } from "./context/UserContext";
import { SocketProvider } from "./context/SocketContext";
import { ToastContainer } from "react-toastify";

const AppInner = () => {
  const { user } = useContext(UserContext);

  return (
    <SocketProvider currentUser={user}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/room" element={<Room />} />
        <Route path="/game" element={<Game />} />
        <Route path="/auth" element={<Auth />} />
      </Routes>
    </SocketProvider>
  );
};

const App = () => {
  return (
    <>
      <ToastContainer />
      <BrowserRouter>
        <UserContextProvider>
          <AppInner />
        </UserContextProvider>
      </BrowserRouter>
    </>
  );
};

export default App;
