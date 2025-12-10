import React from "react";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { walletAddress } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (!walletAddress) {
      navigate("/");
    }
  }, [walletAddress, navigate]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-4 text-gray-800">Dashboard</h1>
        <p className="mb-6 text-gray-600">
          Connected Wallet: <span className="font-medium text-green-600">{walletAddress}</span>
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-xl transition-all">
            View Candidates
          </button>
          <button className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-xl transition-all">
            Cast Vote
          </button>
          <button className="flex-1 bg-purple-500 hover:bg-purple-600 text-white py-3 px-6 rounded-xl transition-all">
            View Results
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
