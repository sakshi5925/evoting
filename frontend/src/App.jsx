import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/layouts/Navbar";
import Home from "./pages/Home";
import Registration from "./components/auth/registration";
import Login from "./components/auth/login";
import CreateElection from "./components/election/createElection";
import ManageUsers from "./components/election/ManageUser";
import ElectionsPage from "./pages/ElectionsPage";
import ElectionDetailPage from "./pages/ElectionDetailPage";
import RegisterCandidate from "./components/candidate/RegisterCandidate";
import ValidateCandidates from "./components/candidate/ValidateCandidate";
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
        window.ethereum.removeListener("accountsChanged", () => { });
        window.ethereum.removeListener("chainChanged", () => { });
      }
    };
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        gutter={12}
        toastOptions={{
          duration: 4000,
          style: {
            background: "rgba(17, 24, 39, 0.75)",
            color: "#E5E7EB",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow:
              "0 20px 40px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.05)",
            borderRadius: "16px",
            padding: "14px 18px",
            fontSize: "15px",
            fontWeight: 500,
          },

          success: {
            iconTheme: {
              primary: "#22c55e",
              secondary: "#052e16",
            },
          },

          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#450a0a",
            },
          },

          loading: {
            iconTheme: {
              primary: "#38bdf8",
              secondary: "#082f49",
            },
          },
        }}
      />
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
        <Route path="/validate-candidates/:electionAddress" element={<ValidateCandidates />} />
      </Routes>
    </BrowserRouter>
  );
}
