import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { connectWallet, registerUser } from "../../redux/slices/authSlice";
import { FaWallet } from "react-icons/fa";
import { MdFingerprint, MdPerson, MdHowToVote } from "react-icons/md";
import { useNavigate } from "react-router-dom";
export default function Registration() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    const name = e.target.name.value;
    const AdhaarNumber = e.target.AdhaarNumber.value;
    const DOB = e.target.DOB.value;
    const VoterID = e.target.VoterID.value;

    try {
      const { walletAddress } = await dispatch(connectWallet()).unwrap();

      await dispatch(
        registerUser({
          name,
          walletAddress,
          AdhaarNumber,
          DOB,
          VoterID,
        })
      ).unwrap();

      alert("Registration Successful!");
      e.target.reset();
      navigate("/login");
    } catch (error) {
      console.error("Error registering user:", error);
      alert("Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center px-4">

      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-600/10 via-transparent to-blue-600/10 blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-xl bg-gray-900/70 backdrop-blur-xl border border-gray-700 shadow-2xl rounded-2xl p-10 relative z-10">

        <h1 className="text-4xl font-extrabold text-center text-green-400 mb-10 drop-shadow-[0_0_10px_rgba(0,255,150,0.4)]">
          Voter Registration
        </h1>

        <form onSubmit={handleRegister} className="space-y-6">

          {/* Full Name */}
          <div>
            <label className="text-gray-300 text-sm font-medium">Full Name</label>
            <div className="flex items-center bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 mt-1">
              <MdPerson className="text-green-400 text-xl mr-3" />
              <input
                type="text"
                name="name"
                required
                placeholder="Enter your full name"
                className="w-full bg-transparent outline-none text-gray-200 placeholder-gray-500"
              />
            </div>
          </div>

          {/* Aadhaar Number */}
          <div>
            <label className="text-gray-300 text-sm font-medium">Aadhaar Number</label>
            <div className="flex items-center bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 mt-1">
              <MdFingerprint className="text-green-400 text-xl mr-3" />
              <input
                type="text"
                maxLength="12"
                required
                name="AdhaarNumber"
                placeholder="Enter 12-digit Aadhaar"
                className="w-full bg-transparent outline-none text-gray-200 placeholder-gray-500"
              />
            </div>
          </div>

          {/* DOB */}
          <div>
            <label className="text-gray-300 text-sm font-medium">Date of Birth</label>
            <input
              type="date"
              name="DOB"
              required
              className="w-full px-4 py-3 mt-1 rounded-xl bg-gray-800 border border-gray-700 text-gray-200 focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>

          {/* Voter ID */}
          <div>
            <label className="text-gray-300 text-sm font-medium">Voter ID</label>
            <div className="flex items-center bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 mt-1">
              <MdHowToVote className="text-green-400 text-xl mr-3" />
              <input
                type="text"
                name="VoterID"
                required
                placeholder="Enter voter ID"
                className="w-full bg-transparent outline-none text-gray-200 placeholder-gray-500"
              />
            </div>
          </div>

          {/* Register Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r 
            from-green-500 to-green-600 text-white py-3 rounded-xl text-lg font-semibold
            shadow-md hover:shadow-green-500/40 hover:scale-[1.02] transition-all
            disabled:bg-gray-500 disabled:scale-100"
          >
            <FaWallet className="text-xl" />
            {loading ? "Registering..." : "Connect Wallet & Register"}
          </button>
        </form>

        <p className="text-center text-sm mt-6 text-gray-400">
          Your blockchain wallet will be linked for secure identity verification.
        </p>
      </div>
    </div>
  );
}
