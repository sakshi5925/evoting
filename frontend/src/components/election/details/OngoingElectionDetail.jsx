import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { getApprovedCandidates } from "../../../redux/slices/candidateSlice";
import { castVote } from "../../../redux/slices/voteSlice";
import { endElection, declareResults } from "../../../redux/slices/electionSlice";

const OngoingElectionDetail = ({ election }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { approvedCandidates } = useSelector((state) => state.candidate);
  const { hasVoted, isLoading, error } = useSelector((state) => state.vote);
  const { user } = useSelector((state) => state.auth);

  const [privateKey, setPrivateKey] = useState("");
  const [showResults, setShowResults] = useState(false);

  const isManager = user?.role === "ELECTION_MANAGER";

  useEffect(() => {
    dispatch(
      getApprovedCandidates({
        electionAddress: election.contractAddress,
      })
    );
  }, [dispatch, election.contractAddress]);

  const handleVote = (candidateId) => {
    if (!privateKey) {
      alert("Private key is required");
      return;
    }

    dispatch(
      castVote({
        privateKey,
        electionAddress: election.contractAddress,
        candidateId,
      })
    );
  };

  const handleEndElection = () => {
    if (!privateKey) return alert("Private key required");
    dispatch(
      endElection({
        privateKey,
        electionAddress: election.contractAddress,
      })
    );
  };

  const handleDeclareResults = () => {
    if (!privateKey) return alert("Private key required");
    dispatch(
      declareResults({
        privateKey,
        electionAddress: election.contractAddress,
      })
    ).then(() => setShowResults(true));
  };

  const end = new Date(election.endTime * 1000);

  return (
    <div className="min-h-screen bg-[#0d1117] text-white px-6 py-12 flex justify-center">
      <div className="max-w-4xl w-full bg-gray-900/70 p-10 rounded-2xl border border-gray-700 shadow-xl">

        {/* BACK */}
        <button
          onClick={() => navigate(-1)}
          className="text-gray-300 hover:text-yellow-400 mb-6"
        >
          ← Back
        </button>

        {/* ELECTION INFO */}
        <h1 className="text-4xl font-extrabold text-yellow-400">
          {election.ElectionName} (Ongoing)
        </h1>

        <p className="text-gray-300 mt-4">{election.description}</p>

        <div className="mt-6 bg-gray-800/50 p-5 rounded-xl border border-gray-700 space-y-2">
          <p><strong>Ends:</strong> {end.toDateString()}</p>
          <p><strong>Total Candidates:</strong> {approvedCandidates.length}</p>
        </div>

        {/* 🔐 MANAGER CONTROLS */}
        {isManager && (
          <div className="mt-8 bg-red-900/20 border border-red-500/40 p-6 rounded-xl space-y-4">
            <h2 className="text-lg font-semibold text-red-400">
              Election Controls (Manager Only)
            </h2>

            <input
              type="password"
              placeholder="Manager private key"
              value={privateKey}
              onChange={(e) => setPrivateKey(e.target.value)}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={handleEndElection}
                className="py-2 rounded-lg bg-red-600 hover:bg-red-700"
              >
                End Election
              </button>

              <button
                onClick={handleDeclareResults}
                className="py-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-black"
              >
                Declare Results
              </button>
            </div>
          </div>
        )}

        {/* 🗳️ VOTING */}
        {!hasVoted && (
          <input
            type="password"
            placeholder="Enter your private key to vote"
            value={privateKey}
            onChange={(e) => setPrivateKey(e.target.value)}
            className="mt-6 w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg"
          />
        )}

        {/* CANDIDATES */}
        <h2 className="mt-10 text-2xl font-bold text-green-400">
          Candidates & Votes
        </h2>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {approvedCandidates.map((c) => (
            <div
              key={c.candidateId}
              className="bg-gray-800/60 border border-gray-700 rounded-xl p-6"
            >
              <p className="text-lg font-semibold">{c.name}</p>
              <p className="text-sm text-gray-400">Party: {c.party}</p>

              {/* LIVE VOTES */}
              <p className="mt-2 text-sm text-blue-400">
                Votes: {c.voteCount ?? 0}
              </p>

              <button
                disabled={hasVoted || isLoading}
                onClick={() => handleVote(c.candidateId)}
                className={`mt-4 w-full py-2 rounded-xl transition
                  ${
                    hasVoted
                      ? "bg-gray-600 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
              >
                {hasVoted ? "Vote Casted" : "Vote"}
              </button>
            </div>
          ))}
        </div>

        {/* STATUS */}
        {isLoading && (
          <p className="text-blue-400 mt-6 text-center">
            Processing...
          </p>
        )}

        {error && (
          <p className="text-red-400 mt-6 text-center">
            {error}
          </p>
        )}

        {showResults && (
          <p className="text-yellow-400 mt-8 text-center font-semibold text-lg">
            🏆 Results have been declared. Check final results page.
          </p>
        )}

      </div>
    </div>
  );
};

export default OngoingElectionDetail;