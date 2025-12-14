import React, { use } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../../redux/slices/authSlice";
import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, walletAddress, isWalletConnected ,token} = useSelector(
    (state) => state.auth
  );

  
  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/login");
  };

  useEffect(() => {
    // console.log auth state changes (for debugging)
    console.log("Auth State Changed:", { user, walletAddress, isWalletConnected });
  }, [user, walletAddress, isWalletConnected]);

  return (
    <nav className="bg-[#0d1117]/80 backdrop-blur-md shadow-lg border-b border-gray-700/40 py-4 px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">

        {/* Logo */}
        <h1
          onClick={() => navigate("/")}
          className="text-3xl font-extrabold text-white tracking-wide cursor-pointer hover:text-green-400 transition-all duration-300"
        >
          eVoting<span className="text-green-500">DApp</span>
        </h1>

        {/* Right Section */}
        <div className="flex items-center gap-5">

          {/* =======================
              IF USER IS LOGGED IN
          ========================== */}
          {user ? (
            <div className="flex items-center gap-4">

              {/* Wallet Address Badge */}
              {isWalletConnected && walletAddress ? (
                <span className="text-sm bg-gray-800/60 border border-gray-700 text-green-300 px-3 py-1 rounded-xl shadow-md">
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </span>
              ) : (
                <span className="text-sm text-red-400 italic">
                  Wallet not connected
                </span>
              )}

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="px-5 py-2 font-semibold text-white rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:shadow-red-500/40 hover:shadow-lg transition-all duration-300"
              >
                Logout
              </button>
            </div>
          ) : (
            /* ===========================
               IF USER NOT LOGGED IN
            ============================ */
            <div className="flex items-center gap-4">

              <Link
                to="/login"
                className="px-5 py-2 font-semibold rounded-xl text-white bg-gradient-to-r from-green-500 to-green-600 hover:shadow-green-500/40 hover:shadow-lg transition-all duration-300"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="px-5 py-2 font-semibold rounded-xl text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:shadow-blue-500/40 hover:shadow-lg transition-all duration-300"
              >
                Signup
              </Link>

            </div>
          )}

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
