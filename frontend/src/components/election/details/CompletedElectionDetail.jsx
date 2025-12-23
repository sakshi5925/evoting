import React, { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { getApprovedCandidates } from "../../../redux/slices/candidateSlice";

const CompletedElectionDetail = ({ election }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { approvedCandidates = [] } = useSelector(
    (state) => state.candidate
  );

  useEffect(() => {
    if (election?.contractAddress) {
      dispatch(
        getApprovedCandidates({
          electionAddress: election.contractAddress,
        })
      );
    }
  }, [dispatch, election?.contractAddress]);

  if (!election) {
    return (
      <p className="text-center text-gray-400 mt-20">
        Election not found
      </p>
    );
  }

  const start = new Date(election.startdate);
  const end = new Date(election.enddate);

  // 🏆 Determine winner
  const winner = useMemo(() => {
    if (!approvedCandidates.length) return null;
    return approvedCandidates.reduce((max, c) =>
      c.voteCount > max.voteCount ? c : max
    );
  }, [approvedCandidates]);

  return (
    <div className="min-h-screen bg-[#0d1117] text-white px-6 py-12 flex justify-center">
      <div className="max-w-5xl w-full bg-gray-900/70 p-10 rounded-2xl border border-gray-700">

        {/* BACK */}
        <button
          onClick={() => navigate(-1)}
          className="text-gray-400 hover:text-green-400 mb-6"
        >
          ← Back
        </button>

        {/* HEADER */}
        <h1 className="text-4xl font-extrabold text-green-500">
          {election.ElectionName}
        </h1>

        <p className="mt-2 text-sm text-gray-300">
          Status: <span className="font-semibold">Completed</span>
        </p>

        <p className="text-gray-300 mt-4">{election.description}</p>

        {/* DATES */}
        <div className="mt-6 bg-gray-800/50 p-4 rounded-lg border border-gray-700">
          <p><strong>Start:</strong> {start.toDateString()}</p>
          <p><strong>End:</strong> {end.toDateString()}</p>
          <p className="mt-1 text-blue-400">
            <strong>Total Votes:</strong> {election.totalVotes}
          </p>
        </div>

        {/* 🏆 WINNER */}
        {winner && (
          <div className="mt-10 border border-yellow-500/40 bg-yellow-900/10 rounded-xl p-6">
            <h2 className="text-xl font-bold text-yellow-400 mb-3">
              🏆 Winner
            </h2>
            <p className="text-lg font-semibold">{winner.name}</p>
            <p className="text-sm text-gray-300">Party: {winner.party}</p>
            <p className="mt-2 text-yellow-400 font-semibold">
              Votes: {winner.voteCount}
            </p>
          </div>
        )}

        {/* 📊 ALL CANDIDATES */}
        <h2 className="mt-12 text-2xl font-bold text-green-400">
          Final Results
        </h2>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full border border-gray-700 rounded-lg overflow-hidden">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left">Candidate</th>
                <th className="px-4 py-3 text-left">Party</th>
                <th className="px-4 py-3 text-right">Votes</th>
                <th className="px-4 py-3 text-center">Result</th>
              </tr>
            </thead>
            <tbody>
              {approvedCandidates.map((c) => (
                <tr
                  key={c.candidateId}
                  className={`border-t border-gray-700 ${
                    winner && c._id === winner._id
                      ? "bg-yellow-900/20"
                      : "bg-gray-900"
                  }`}
                >
                  <td className="px-4 py-3">{c.name}</td>
                  <td className="px-4 py-3">{c.party}</td>
                  <td className="px-4 py-3 text-right">
                    {c.voteCount}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {winner && c._id === winner._id ? (
                      <span className="text-yellow-400 font-semibold">
                        Winner
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};

export default CompletedElectionDetail;
  