import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  startCandidateRegistration,
  startVoting,
  endElection,
  declareResults,
  deactivateElection,
  reactivateElection,
  changeStatus,
  getWinner,
} from "../../../redux/slices/electionSlice";

const UpcomingElectionDetail = ({ election, userStatus }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isLoading, error } = useSelector((state) => state.election);

  const start = new Date(election.ElectionStartTime);
  const end = new Date(election.ElectionEndTime);
  const deadline = new Date(election.registrationDeadline);

  const isManager = userStatus === "manager"; // you can adjust based on login roles

  // ---------------------------
  // Handler Functions
  // ---------------------------

  const handleStartCandidateRegistration = () => {
    dispatch(startCandidateRegistration({ privateKey: election.privateKey, electionAddress: election.address }));
  };

  const handleStartVoting = () => {
    dispatch(startVoting({ privateKey: election.privateKey, electionAddress: election.address }));
  };

  const handleEndElection = () => {
    dispatch(endElection({ privateKey: election.privateKey, electionAddress: election.address }));
  };

  const handleDeclareResults = () => {
    dispatch(declareResults({ privateKey: election.privateKey, electionAddress: election.address }));
  };

  const handleDeactivate = () => {
    dispatch(deactivateElection({ privateKey: election.privateKey, electionAddress: election.address }));
  };

  const handleReactivate = () => {
    dispatch(reactivateElection({ privateKey: election.privateKey, electionAddress: election.address }));
  };

  const handleChangeStatus = () => {
    dispatch(changeStatus({ privateKey: election.privateKey, electionAddress: election.address }));
  };

  const handleGetWinner = () => {
    dispatch(getWinner({ electionAddress: election.address }));
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-white px-6 py-12 flex justify-center">
      <div className="max-w-3xl bg-gray-900/70 p-10 rounded-2xl border border-gray-700 shadow-xl">

        <button onClick={() => navigate(-1)} className="text-gray-300 hover:text-green-400 mb-6">
          ← Back
        </button>

        <h1 className="text-4xl font-extrabold text-green-400">{election.ElectionName}</h1>
        <p className="text-gray-300 mt-4">{election.description}</p>

        {/* Important Dates */}
        <div className="mt-8 bg-gray-800/50 p-6 rounded-xl border border-gray-700">
          <h2 className="text-xl font-bold">📅 Important Dates</h2>
          <p><strong>Start:</strong> {start.toDateString()}</p>
          <p><strong>End:</strong> {end.toDateString()}</p>
          <p><strong>Registration Deadline:</strong> {deadline.toDateString()}</p>
          <p><strong>Status:</strong> <span className="text-green-400">{election.status}</span></p>
        </div>

        {/* Actions */}
        <div className="mt-10 flex flex-col gap-4">

          {/* -------------------------------- */}
          {/* Voter Registration */}
          {/* -------------------------------- */}
          <button
            className="py-3 rounded-xl bg-green-600 hover:scale-105 transition"
            disabled={Date.now() > deadline}
            onClick={() => navigate(`/register-voter/${election.address}`)}
          >
            Register as Voter
          </button>

          {/* -------------------------------- */}
          {/* Candidate Registration */}
          {/* -------------------------------- */}
          <button
            className="py-3 rounded-xl bg-blue-600 hover:scale-105 transition"
            disabled={Date.now() > deadline}
            onClick={() => navigate(`/register-candidate/${election.address}`)}
          >
            Register as Candidate
          </button>

          {/* -------------------------------- */}
          {/* Admin Only Buttons */}
          {/* -------------------------------- */}
          {isManager && (
            <>
              <h2 className="mt-8 text-2xl font-bold text-gray-300">Admin Controls</h2>

              <button
                className="py-3 rounded-xl bg-yellow-600 hover:scale-105 transition"
                onClick={handleStartCandidateRegistration}
              >
                Start Candidate Registration
              </button>

              <button
                className="py-3 rounded-xl bg-indigo-600 hover:scale-105 transition"
                onClick={handleStartVoting}
              >
                Start Voting
              </button>

              <button
                className="py-3 rounded-xl bg-red-600 hover:scale-105 transition"
                onClick={handleEndElection}
              >
                End Election
              </button>

              <button
                className="py-3 rounded-xl bg-purple-700 hover:scale-105 transition"
                onClick={handleDeclareResults}
              >
                Declare Results
              </button>

              <button
                className="py-3 rounded-xl bg-orange-600 hover:scale-105 transition"
                onClick={handleChangeStatus}
              >
                Change Status
              </button>

              <button
                className="py-3 rounded-xl bg-gray-700 hover:scale-105 transition"
                onClick={handleDeactivate}
              >
                Deactivate Election
              </button>

              <button
                className="py-3 rounded-xl bg-green-700 hover:scale-105 transition"
                onClick={handleReactivate}
              >
                Reactivate Election
              </button>

              <button
                className="py-3 rounded-xl bg-teal-600 hover:scale-105 transition"
                onClick={handleGetWinner}
              >
                Get Winner
              </button>
            </>
          )}
        </div>

        {/* Loading + Error */}
        {isLoading && <p className="text-green-400 mt-4">Processing...</p>}
        {error && <p className="text-red-400 mt-4">{error}</p>}

      </div>
    </div>
  );
};

export default UpcomingElectionDetail;
