import React from "react";
import { useNavigate } from "react-router-dom";

const OngoingElectionDetail = ({ election }) => {
  const navigate = useNavigate();
  const end = new Date(election.ElectionEndTime);

  return (
    <div className="min-h-screen bg-[#0d1117] text-white px-6 py-12 flex justify-center">
      <div className="max-w-3xl bg-gray-900/70 p-10 rounded-2xl border border-gray-700 shadow-xl">

        <button onClick={() => navigate(-1)} className="text-gray-300 hover:text-yellow-400 mb-6">
          ← Back
        </button>

        <h1 className="text-4xl font-extrabold text-yellow-400">{election.ElectionName} (Ongoing)</h1>
        <p className="text-gray-300 mt-4">{election.description}</p>

        <div className="mt-8 bg-gray-800/50 p-6 rounded-xl border border-gray-700">
          <p><strong>Ends:</strong> {end.toDateString()}</p>
        </div>

        <div className="mt-10 flex flex-col gap-4">
          <button className="py-3 rounded-xl bg-green-600 hover:scale-105 transition">
            Vote Now
          </button>
          <button className="py-3 rounded-xl bg-blue-600 hover:scale-105 transition">
            View Live Results
          </button>
        </div>

      </div>
    </div>
  );
};

export default OngoingElectionDetail;
