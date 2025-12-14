import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { connectWallet, loginUser } from "../../redux/slices/authSlice";
import { useNavigate } from "react-router-dom";
import { FaWallet } from "react-icons/fa";
import { MdVerifiedUser } from "react-icons/md";

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { walletAddress } = await dispatch(connectWallet()).unwrap();
      await dispatch(
        loginUser({
          walletAddress,
          AdhaarNumber: e.target.AdhaarNumber.value,
        })
      ).unwrap();

      alert("Login Successful!");
      navigate("/");
      e.target.reset();
    } catch (error) {
      console.error("Login error:", error);
      alert("Login failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center px-4">
      
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-transparent to-blue-600/10 blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md bg-gray-900/60 border border-gray-700 backdrop-blur-xl shadow-2xl rounded-2xl p-10 relative z-10">

        {/* Title */}
        <h1 className="text-4xl font-extrabold text-center text-green-400 mb-8 drop-shadow-[0_0_10px_rgba(0,255,150,0.4)]">
          Voter Login
        </h1>

        <form onSubmit={handleLogin} className="space-y-6">

          {/* Aadhaar Field */}
          <div>
            <label className="block mb-1 font-medium text-gray-300">
              Aadhaar Number
            </label>

            <div className="flex items-center bg-gray-800 border border-gray-700 rounded-xl px-4 py-3">
              <MdVerifiedUser className="text-green-400 text-xl mr-3" />
              <input
                type="text"
                name="AdhaarNumber"
                required
                maxLength="12"
                placeholder="Enter your 12-digit Aadhaar"
                className="w-full bg-transparent outline-none text-gray-200 placeholder-gray-500"
              />
            </div>
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r 
            from-green-500 to-green-600 text-white py-3 rounded-xl font-semibold text-lg
            hover:shadow-green-500/40 hover:scale-[1.02] transition-all disabled:bg-gray-500"
          >
            <FaWallet className="text-xl" />
            {loading ? "Connecting Wallet..." : "Connect Wallet & Login"}
          </button>
        </form>

        <p className="text-center text-sm mt-6 text-gray-400">
          Your wallet will be automatically verified during login.
        </p>
      </div>
    </div>
  );
}
