import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Auth from "./pages/Auth";
import Home from "./pages/Home";
import { UserContextProvider } from "./context/UserContext";
import { ToastContainer } from "react-toastify";
const App = () => {
  return (
    <>
      <ToastContainer />
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <UserContextProvider>
                <Home />
              </UserContextProvider>
            }
          />
          <Route
            path="/auth"
            element={
              <UserContextProvider>
                <Auth />
              </UserContextProvider>
            }
          />
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;
