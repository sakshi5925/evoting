import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { getApprovedCandidates } from "../../../redux/slices/candidateSlice";
import { endElection, declareResults } from "../../../redux/slices/electionSlice";

const CompletedElectionDetail = ({ election }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { approvedCandidates = [] } = useSelector(
    (state) => state.candidate
  );

  const { user } = useSelector((state) => state.auth);
  const isManager = user?.role === "ELECTION_MANAGER";

  const [privateKey, setPrivateKey] = useState("");
  const [resultsDeclared, setResultsDeclared] = useState(
    election.status === "ResultDeclared"
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
      <div className="min-h-screen bg-[#0b0f14] flex items-center justify-center text-gray-400">
        Election not found
      </div>
    );
  }

  const start = new Date(election.startdate);
  const end = new Date(election.enddate);

  // 🏆 Winner (only after results declared)
  const winner = useMemo(() => {
    if (!resultsDeclared || !approvedCandidates.length) return null;
    return approvedCandidates.reduce((max, c) =>
      c.voteCount > max.voteCount ? c : max
    );
  }, [approvedCandidates, resultsDeclared]);

  const handleDeclareResults = async () => {
    if (!privateKey) {
      alert("Private key required");
      return;
    }

    await dispatch(
      endElection({
        privateKey,
        electionAddress: election.contractAddress,
      })
    );

    await dispatch(
      declareResults({
        privateKey,
        electionAddress: election.contractAddress,
      })
    );

    setResultsDeclared(true);
  };

  return (
    <div className="min-h-screen bg-[#0b0f14] px-6 py-12 text-gray-100">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="mb-3 text-sm text-gray-400 hover:text-gray-200 transition"
          >
            ← Back
          </button>

          <h1 className="text-3xl font-semibold tracking-tight">
            {election.ElectionName}
          </h1>

          <p className="text-sm text-gray-400 mt-1">
            Status:{" "}
            <span className="text-green-400 font-medium">{election.status}</span>
          </p>
        </div>

        {/* Summary */}
        <div className="bg-[#0f172a] border border-white/10 rounded-xl p-6 mb-10">
          <p className="text-gray-300">{election.description}</p>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <Stat label="Start Date" value={start.toDateString()} />
            <Stat label="End Date" value={end.toDateString()} />
            <Stat label="Total Votes" value={election.totalVotes} highlight />
          </div>
        </div>

        {/* Manager Controls */}
        {isManager && !resultsDeclared && (
          <div className="mb-10 bg-red-500/5 border border-red-500/30 rounded-xl p-6">
            <h2 className="text-lg font-medium text-red-400 mb-4">
              Manager Controls
            </h2>

            <input
              type="password"
              placeholder="Manager private key"
              value={privateKey}
              onChange={(e) => setPrivateKey(e.target.value)}
              className="w-full mb-4 px-4 py-3 rounded-md bg-[#020617]
                         border border-white/10 text-gray-200"
            />

            <button
              onClick={handleDeclareResults}
              className="py-2 px-6 rounded-md bg-yellow-500 text-black
                         hover:bg-yellow-600 transition"
            >
              End Election & Declare Results
            </button>
          </div>
        )}

        {/* Results (VISIBLE ONLY AFTER DECLARATION) */}
        {resultsDeclared && (
          <>
            {/* Winner */}
            {winner && (
              <div className="mb-12 bg-yellow-500/5 border border-yellow-500/30 rounded-xl p-6">
                <h2 className="text-lg font-medium text-yellow-400 mb-2">
                  🏆 Winner
                </h2>

                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <p className="text-xl font-semibold">{winner.name}</p>
                    <p className="text-sm text-gray-400">
                      Party: {winner.party}
                    </p>
                  </div>

                  <div className="text-yellow-400 font-semibold">
                    Votes: {winner.voteCount}
                  </div>
                </div>
              </div>
            )}

            {/* Results Table */}
            <div className="bg-[#0f172a] border border-white/10 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-white/10">
                <h2 className="text-lg font-medium">Final Results</h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[#020617] text-gray-400">
                    <tr>
                      <th className="px-6 py-4 text-left">Candidate</th>
                      <th className="px-6 py-4 text-left">Party</th>
                      <th className="px-6 py-4 text-right">Votes</th>
                      <th className="px-6 py-4 text-center">Result</th>
                    </tr>
                  </thead>

                  <tbody>
                    {approvedCandidates.map((c) => {
                      const isWinner = winner && c._id === winner._id;

                      return (
                        <tr
                          key={c.candidateId}
                          className={`border-b border-white/5 ${
                            isWinner
                              ? "bg-yellow-500/10"
                              : "hover:bg-white/5"
                          }`}
                        >
                          <td className="px-6 py-4 font-medium">{c.name}</td>
                          <td className="px-6 py-4 text-gray-400">{c.party}</td>
                          <td className="px-6 py-4 text-right font-mono">
                            {c.voteCount}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {isWinner ? (
                              <span className="px-3 py-1 rounded-full text-xs
                                bg-yellow-500/20 text-yellow-400">
                                Winner
                              </span>
                            ) : (
                              <span className="text-gray-500">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CompletedElectionDetail;

/* ---------- UI Helpers ---------- */

const Stat = ({ label, value, highlight }) => (
  <div>
    <p className="text-xs text-gray-400">{label}</p>
    <p
      className={`mt-1 text-sm font-medium ${
        highlight ? "text-blue-400" : "text-gray-200"
      }`}
    >
      {value}
    </p>
  </div>
);
