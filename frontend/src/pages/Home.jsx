import React from "react";
import { useSelector } from "react-redux";

const Home = () => {
  const { walletAddress, isWalletConnected } = useSelector((state) => state.auth);

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center p-6">
      <div className="bg-white rounded-2xl shadow-xl p-10 max-w-lg w-full text-center">
        <h1 className="text-4xl font-bold mb-6 text-gray-800">Welcome to eVoting System</h1>

        {isWalletConnected && walletAddress ? (
          <p className="text-green-600 font-medium mb-6">
            Wallet Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
          </p>
        ) : (
          <p className="text-red-500 font-medium mb-6">
            Please connect your wallet using the button in the Navbar.
          </p>
        )}

       

        <div className="flex justify-center gap-4">
          <button className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-all">
            Learn How to Vote
          </button>
          <button className="bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-lg transition-all">
            Explore Candidates
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
