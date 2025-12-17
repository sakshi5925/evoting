import React from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { getUpcomingElections } from "../../../redux/slices/electionSlice";

const CompletedElectionDetail = ({}) => {
  const navigate = useNavigate();

  const start = new Date(election.ElectionStartTime);
  const end = new Date(election.ElectionEndTime);

  return (
    <div className="min-h-screen bg-[#0d1117] text-white px-6 py-12 flex justify-center">
      <div className="max-w-3xl bg-gray-900/70 p-10 rounded-2xl border border-gray-700 shadow-xl">

        <button onClick={() => navigate(-1)} className="text-gray-300 hover:text-green-400 mb-6">
          ← Back
        </button>

        <h1 className="text-4xl font-extrabold text-green-500">{election.ElectionName} (Completed)</h1>
        <p className="text-gray-300 mt-4">{election.description}</p>

        <div className="mt-8 bg-gray-800/50 p-6 rounded-xl border border-gray-700">
          <p><strong>Start:</strong> {start.toDateString()}</p>
          <p><strong>End:</strong> {end.toDateString()}</p>
        </div>

        <div className="mt-10">
          <button className="w-full py-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600 hover:scale-105 transition">
            View Final Results
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompletedElectionDetail;
