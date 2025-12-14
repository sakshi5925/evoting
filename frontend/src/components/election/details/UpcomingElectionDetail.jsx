import React from "react";
import { useNavigate } from "react-router-dom";

const UpcomingElectionDetail = ({ election, userStatus }) => {
  const navigate = useNavigate();
  const start = new Date(election.ElectionStartTime);
  const end = new Date(election.ElectionEndTime);
  const deadline = new Date(election.registrationDeadline);

  return (
    <div className="min-h-screen bg-[#0d1117] text-white px-6 py-12 flex justify-center">
      <div className="max-w-3xl bg-gray-900/70 p-10 rounded-2xl border border-gray-700 shadow-xl">

        <button onClick={() => navigate(-1)} className="text-gray-300 hover:text-green-400 mb-6">
          ← Back
        </button>

        <h1 className="text-4xl font-extrabold text-green-400">{election.ElectionName}</h1>
        <p className="text-gray-300 mt-4">{election.description}</p>

        <div className="mt-8 bg-gray-800/50 p-6 rounded-xl border border-gray-700">
          <h2 className="text-xl font-bold">📅 Important Dates</h2>
          <p><strong>Start:</strong> {start.toDateString()}</p>
          <p><strong>End:</strong> {end.toDateString()}</p>
          <p><strong>Registration:</strong> {deadline.toDateString()}</p>
        </div>

        <div className="mt-10 flex flex-col gap-4">
          <button className="py-3 rounded-xl bg-green-600 hover:scale-105 transition">
            Register as Voter
          </button>

          <button className="py-3 rounded-xl bg-blue-600 hover:scale-105 transition">
            Register as Candidate
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpcomingElectionDetail;
