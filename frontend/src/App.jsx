import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useDispatch } from "react-redux";
import Navbar from "./components/layouts/Navbar";
import Home from "./pages/Home";
import Registration from "./components/auth/registration";
import Login from "./components/auth/login";
import CreateElection from "./components/election/createElection";
import ManageUsers from "./components/election/ManageUser";
import ElectionsPage from "./pages/ElectionsPage";
import ElectionDetailPage from "./pages/ElectionDetailPage";
import RegisterCandidate from "./components/candidate/RegisterCandidate";

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
        <Route path="/register" element={<Registration />} />
        <Route path="/login" element={<Login />} />
        <Route path="/create-election" element={<CreateElection />} />
        <Route path="/manage-users" element={<ManageUsers />} />
        <Route path="/elections" element={<ElectionsPage />} />
        <Route path="/election/:id" element={<ElectionDetailPage />} />
        <Route path="/register-candidate/:electionAddress" element={<RegisterCandidate />} />
      </Routes>
    </BrowserRouter>
  );
}
