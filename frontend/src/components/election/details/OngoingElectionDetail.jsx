import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { getApprovedCandidates } from "../../../redux/slices/candidateSlice";
import { castVote } from "../../../redux/slices/voteSlice";
import {
  startVoting,
  endElection,
  declareResults,
} from "../../../redux/slices/electionSlice";

const OngoingElectionDetail = ({ election }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { approvedCandidates = [] } = useSelector((state) => state.candidate);
  const { hasVoted, isLoading, error } = useSelector((state) => state.vote);
  const { user } = useSelector((state) => state.auth);

  const [privateKey, setPrivateKey] = useState("");
  const [showResults, setShowResults] = useState(false);

  const isManager = user?.role === "ELECTION_MANAGER";
  const status = election.status;

  useEffect(() => {
    dispatch(
      getApprovedCandidates({
        electionAddress: election.contractAddress,
      })
    );
  }, [dispatch, election.contractAddress]);

  const requireKey = () => {
    if (!privateKey) {
      alert("Private key required");
      return false;
    }
    return true;
  };

  const endDate = new Date(election.endTime * 1000);

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
            <span className="text-blue-400 font-medium">{status}</span>
          </p>
        </div>

        {/* Summary */}
        <div className="bg-[#0f172a] border border-white/10 rounded-xl p-6 mb-10">
          <p className="text-gray-300">{election.description}</p>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <Stat label="Ends On" value={endDate.toDateString()} />
            <Stat
              label="Candidates"
              value={approvedCandidates.length}
            />
            {(status === "Voting" || status === "Ended") && (
              <Stat
                label="Votes Cast"
                value={election.totalVotes}
                highlight
              />
            )}
          </div>
        </div>

        {/* Manager Controls (ONLY during Registration) */}
        {isManager && status === "Registration" && (
          <div className="mb-12 bg-red-500/5 border border-red-500/30 rounded-xl p-6">
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

            <PrimaryButton
              label="Start Voting"
              onClick={() =>
                requireKey() &&
                dispatch(
                  startVoting({
                    privateKey,
                    electionAddress: election.contractAddress,
                  })
                )
              }
            />
          </div>
        )}

        {/* Voting Section */}
        {status === "Voting" && !hasVoted && !isManager && (
          <div className="mb-10 bg-[#0f172a] border border-white/10 rounded-xl p-6">
            <h2 className="text-lg font-medium mb-4">
              Cast Your Vote
            </h2>

            <input
              type="password"
              placeholder="Your private key"
              value={privateKey}
              onChange={(e) => setPrivateKey(e.target.value)}
              className="w-full mb-4 px-4 py-3 rounded-md bg-[#020617]
                         border border-white/10 text-gray-200"
            />
          </div>
        )}

        {/* Candidates */}
        <div className="bg-[#0f172a] border border-white/10 rounded-xl p-6">
          <h2 className="text-lg font-medium mb-6">
            Candidates
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {approvedCandidates.map((c) => (
              <div
                key={c.candidateId}
                className="border border-white/10 rounded-lg p-5
                           hover:bg-white/5 transition"
              >
                <p className="text-base font-medium">{c.name}</p>
                <p className="text-sm text-gray-400">
                  Party: {c.party}
                </p>

                {status === "ResultDeclared" && (
                  <p className="mt-2 text-sm text-blue-400">
                    Votes: {c.voteCount ?? 0}
                  </p>
                )}

                {status === "Voting" && (
                  <button
                    disabled={hasVoted || isLoading}
                    onClick={() =>
                      requireKey() &&
                      dispatch(
                        castVote({
                          privateKey,
                          electionAddress: election.contractAddress,
                          candidateId: c.candidateId,
                        })
                      )
                    }
                    className={`mt-4 w-full py-2 rounded-md text-sm
                      ${hasVoted
                        ? "bg-gray-600 cursor-not-allowed"
                        : "bg-green-600 hover:bg-green-700"
                      }`}
                  >
                    {hasVoted ? "Vote Cast" : "Vote"}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Status Messages */}
        {isLoading && (
          <p className="text-blue-400 mt-6 text-center">
            Processing transaction…
          </p>
        )}

        {error && (
          <p className="text-red-400 mt-6 text-center">
            {error}
          </p>
        )}

        {showResults && (
          <p className="text-yellow-400 mt-8 text-center font-medium">
            🏆 Results declared successfully
          </p>
        )}
      </div>
    </div>
  );
};

export default OngoingElectionDetail;

/* ---------- UI Helpers ---------- */

const Stat = ({ label, value, highlight }) => (
  <div>
    <p className="text-xs text-gray-400">{label}</p>
    <p
      className={`mt-1 text-sm font-medium ${highlight ? "text-blue-400" : "text-gray-200"
        }`}
    >
      {value}
    </p>
  </div>
);

const PrimaryButton = ({ label, onClick }) => (
  <button
    onClick={onClick}
    className="py-2 rounded-md bg-green-600 hover:bg-green-700 transition"
  >
    {label}
  </button>
);

const DangerButton = ({ label, onClick }) => (
  <button
    onClick={onClick}
    className="py-2 rounded-md bg-red-600 hover:bg-red-700 transition"
  >
    {label}
  </button>
);

const WarningButton = ({ label, onClick }) => (
  <button
    onClick={onClick}
    className="py-2 rounded-md bg-yellow-500 text-black hover:bg-yellow-600 transition"
  >
    {label}
  </button>
);
