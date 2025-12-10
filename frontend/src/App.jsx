import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useDispatch } from "react-redux";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";

import { connectWallet, logoutUser } from "./redux/slices/authSlice";

export default function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Restore wallet on reload
    dispatch(connectWallet());

    // Listen to MetaMask events
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length === 0) {
          dispatch(logoutUser()); // clear everything
        } else {
          // Reconnect the new account
          dispatch(connectWallet());
        }
      });

      window.ethereum.on("chainChanged", () => {
        // Simply reload the page on network change
        window.location.reload();
      });
    }

    // Cleanup listeners on unmount
    return () => {
      if (window.ethereum && window.ethereum.removeListener) {
        window.ethereum.removeListener("accountsChanged", () => {});
        window.ethereum.removeListener("chainChanged", () => {});
      }
    };
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
