import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import {
  startCandidateRegistration,
  startVoting,
  endElection,
  declareResults,
  deactivateElection,
  reactivateElection,
  getUpcomingElections,
} from "../../../redux/slices/electionSlice";

import { checkRoles } from "../../../redux/slices/roleSlice";

const UpcomingElectionDetail = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams(); 

  const { user } = useSelector((state) => state.auth);
  const {
    upcomingElections = [],
    isLoading,
    error,
  } = useSelector((state) => state.election);

  const [election, setElection] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  /* ---------------- Fetch Upcoming Elections ---------------- */
  useEffect(() => {
    if (!upcomingElections.length) {
      dispatch(getUpcomingElections());
    }
  }, [dispatch, upcomingElections.length]);

  /* ---------------- Find Election by Contract Address ---------------- */
  useEffect(() => {
    if (!id || !upcomingElections.length) return;

    const foundElection = upcomingElections.find(
      (e) => e._id === id
    );

    setElection(foundElection || null);
  }, [id, upcomingElections]);

  /* ---------------- Check Admin Role ---------------- */
  useEffect(() => {
    if (!user?.walletAddress) return;

    dispatch(checkRoles({ walletAddress: user.walletAddress })).then((res) => {
      if (res.payload?.isAdmin || res.payload?.isElectionManager) {
        setIsAdmin(true);
      }
    });
  }, [dispatch, user?.walletAddress]);

  /* ---------------- Guards ---------------- */
  if (isLoading) {
    return <p className="text-center text-green-400">Loading election…</p>;
  }

  if (!election) {
    return <p className="text-center text-gray-400">Election not found</p>;
  }

  /* ---------------- Dates (USE DB DATES) ---------------- */
  const start = new Date(election.startdate);
  const end = new Date(election.enddate);
  const deadline = new Date(election.registrationDeadline * 1000);

  const isRegistrationOpen =
    election.status === "Created" && Date.now() < deadline.getTime();

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen bg-[#0d1117] text-white px-6 py-12">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="text-gray-400 hover:text-green-400"
        >
          ← Back
        </button>

        {/* Header */}
        <div className="bg-gray-900/80 p-8 rounded-2xl border border-gray-700">
          <h1 className="text-4xl font-bold text-green-400">
            {election.name}
          </h1>
          <p className="text-gray-300 mt-3">{election.description}</p>

          <span className="inline-block mt-4 px-4 py-1 rounded-full bg-blue-600/20 text-blue-400">
            UPCOMING
          </span>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <InfoCard label="Start Date" value={start.toDateString()} />
          <InfoCard label="End Date" value={end.toDateString()} />
          <InfoCard
            label="Registration Deadline"
            value={deadline.toDateString()}
          />
        </div>

        {/* Participation */}
        {isRegistrationOpen && (
          <div className="bg-gray-900/80 p-8 rounded-2xl border border-gray-700">
            <h2 className="text-xl font-semibold mb-4">🗳 Participation</h2>

            <div className="grid md:grid-cols-2 gap-4">
              <ActionButton
                label="Register as Voter"
                onClick={() =>
                  navigate(`/register-voter/${election.contractAddress}`)
                }
              />
              <ActionButton
                label="Register as Candidate"
                onClick={() =>
                  navigate(`/register-candidate/${election.contractAddress}`)
                }
              />
            </div>
          </div>
        )}

        {/* Admin Panel */}
        {isAdmin && (
          <div className="bg-gray-900/90 p-8 rounded-2xl border border-red-500/40">
            <h2 className="text-xl font-bold text-red-400 mb-4">
              🔐 Admin Controls
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              <AdminButton
                label="Start Registration"
                onClick={() =>
                  dispatch(
                    startCandidateRegistration({
                      privateKey: user.privateKey,
                      electionAddress: election.contractAddress,
                    })
                  )
                }
              />
              <AdminButton
                label="Start Voting"
                onClick={() =>
                  dispatch(
                    startVoting({
                      privateKey: user.privateKey,
                      electionAddress: election.contractAddress,
                    })
                  )
                }
              />
              <AdminButton
                label="End Election"
                onClick={() =>
                  dispatch(
                    endElection({
                      privateKey: user.privateKey,
                      electionAddress: election.contractAddress,
                    })
                  )
                }
              />
              <AdminButton
                label="Declare Results"
                onClick={() =>
                  dispatch(
                    declareResults({
                      privateKey: user.privateKey,
                      electionAddress: election.contractAddress,
                    })
                  )
                }
              />
              <AdminButton
                label="Deactivate"
                onClick={() =>
                  dispatch(
                    deactivateElection({
                      privateKey: user.privateKey,
                      electionAddress: election.contractAddress,
                    })
                  )
                }
              />
              <AdminButton
                label="Reactivate"
                onClick={() =>
                  dispatch(
                    reactivateElection({
                      privateKey: user.privateKey,
                      electionAddress: election.contractAddress,
                    })
                  )
                }
              />
            </div>
          </div>
        )}

        {error && (
          <p className="text-center text-red-400">{error}</p>
        )}
      </div>
    </div>
  );
};

export default UpcomingElectionDetail;

/* ---------------- UI Helpers ---------------- */

const InfoCard = ({ label, value }) => (
  <div className="bg-gray-900/80 border border-gray-700 rounded-xl p-6">
    <p className="text-sm text-gray-400">{label}</p>
    <p className="text-lg font-semibold mt-2">{value}</p>
  </div>
);

const ActionButton = ({ label, onClick }) => (
  <button
    onClick={onClick}
    className="py-4 rounded-xl bg-green-600 hover:bg-green-700 font-semibold transition"
  >
    {label}
  </button>
);

const AdminButton = ({ label, onClick }) => (
  <button
    onClick={onClick}
    className="py-3 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-600 font-medium transition"
  >
    {label}
  </button>
);
