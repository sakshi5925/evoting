import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { connectWallet, logoutUser } from "../redux/slices/authSlice";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { walletAddress, isWalletConnected, chainId, isLoading } = useSelector(
    (state) => state.auth
  );

  const handleWalletAction = async () => {
    if (isWalletConnected) {
      dispatch(logoutUser());
    } else {
      await dispatch(connectWallet());
    }
  };

  return (
    <nav className="bg-gray-900 text-white shadow-md py-4 px-6 flex flex-col sm:flex-row justify-between items-center">
      {/* Logo */}
      <div className="flex items-center gap-6 mb-3 sm:mb-0">
        <h1
          className="text-2xl font-bold cursor-pointer hover:text-green-400 transition-colors"
          onClick={() => navigate("/")}
        >
          eVoting DApp
        </h1>

        {/* Navigation Links */}
        <div className="flex gap-3">
          <Link
            to="/dashboard"
            className="hover:bg-gray-800 px-3 py-1 rounded-md transition-colors"
          >
            Dashboard
          </Link>
          <Link
            to="/results"
            className="hover:bg-gray-800 px-3 py-1 rounded-md transition-colors"
          >
            Results
          </Link>
        </div>
      </div>

      {/* Wallet Info + Button */}
      <div className="flex items-center gap-4">
        {isWalletConnected && walletAddress ? (
          <div className="text-right">
            <p className="font-medium text-green-300">
              {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </p>
            <p className="text-sm text-gray-400">Network: {chainId}</p>
          </div>
        ) : (
          <p className="font-medium text-red-400">Wallet not connected</p>
        )}

        <button
          onClick={handleWalletAction}
          disabled={isLoading}
          className={`py-2 px-4 font-semibold rounded-lg transition-all duration-300 ${
            isLoading
              ? "bg-gray-500 cursor-not-allowed"
              : isWalletConnected
              ? "bg-red-500 hover:bg-red-600"
              : "bg-green-500 hover:bg-green-600"
          }`}
        >
          {isLoading
            ? "Processing..."
            : isWalletConnected
            ? "Disconnect"
            : "Connect Wallet"}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
