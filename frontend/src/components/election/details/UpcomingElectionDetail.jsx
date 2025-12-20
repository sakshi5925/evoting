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

const UpcomingElectionDetail = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  const { user } = useSelector((state) => state.auth);
  const { upcomingElections = [], isLoading, error } =
    useSelector((state) => state.election);

  const [election, setElection] = useState(null);
  const [privateKey, setPrivateKey] = useState("");

  /* ---------------- Roles ---------------- */
  const isSuperAdmin = user?.role === "SUPER_ADMIN";
  const isManager = user?.role === "ELECTION_MANAGER";

  /* ---------------- Fetch Elections ---------------- */
  useEffect(() => {
    if (!upcomingElections.length) {
      dispatch(getUpcomingElections());
    }
  }, [dispatch, upcomingElections.length]);

  /* ---------------- Find Election ---------------- */
  useEffect(() => {
    if (!id || !upcomingElections.length) return;
    const found = upcomingElections.find((e) => e._id === id);
    setElection(found || null);
  }, [id, upcomingElections]);

  /* ---------------- Guards ---------------- */
  if (isLoading) {
    return <p className="text-center text-blue-400">Loading…</p>;
  }

  if (!election) {
    return <p className="text-center text-gray-400">Election not found</p>;
  }

  /* ---------------- Dates ---------------- */
  const start = new Date(election.startdate);
  const end = new Date(election.enddate);
  const deadline = new Date(election.registrationDeadline * 1000);

  /* ---------------- Status Helpers ---------------- */
  const status = election.status;

  const canStartRegistration =
    isManager && status === "Created";

  const canStartVoting =
    isManager && status === "Registration";

  // const canEndElection =
  //   isManager && status === "Voting";

  // const canDeclareResult =
  //   isManager && status === "Ended";

  const canDeactivate =
    isSuperAdmin && election.isActive;

  const canReactivate =
    isSuperAdmin && !election.isActive;

  const isRegistrationOpen =
    status === "Registration" && Date.now() < deadline.getTime();

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-6 py-10">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-slate-400 hover:text-slate-200"
        >
          ← Back
        </button>

        {/* Header */}
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-8">
          <h1 className="text-3xl font-semibold">{election.name}</h1>
          <p className="text-slate-400 mt-2">{election.description}</p>

          <span className="inline-block mt-4 px-3 py-1 text-sm border border-blue-400 text-blue-400 rounded">
            Status: {status}
          </span>
        </div>

        {/* Dates */}
        <div className="grid md:grid-cols-3 gap-6">
          <InfoCard label="Start Date" value={start.toDateString()} />
          <InfoCard label="End Date" value={end.toDateString()} />
          <InfoCard label="Registration Deadline" value={deadline.toDateString()} />
        </div>

        {/* Participation */}
        {isRegistrationOpen && (
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-8">
            <h2 className="text-lg font-semibold mb-6">Participation</h2>
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

        {/* 🔐 ADMIN / MANAGER CONTROLS */}
        {(isManager || isSuperAdmin) && (
          <div className="bg-slate-900 border border-red-500/40 rounded-lg p-8 space-y-6">
            <h2 className="text-lg font-semibold text-red-400">
              Administrative Controls
            </h2>

            <input
              type="password"
              placeholder="Private key"
              value={privateKey}
              onChange={(e) => setPrivateKey(e.target.value)}
              className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded"
            />

            <div className="grid md:grid-cols-2 gap-4">

              {/* MANAGER ACTIONS */}
              {isManager && (
                <>
                  <AdminButton
                    label="Start Registration"
                    disabled={!privateKey || !canStartRegistration}
                    onClick={() =>
                      dispatch(startCandidateRegistration({
                        privateKey,
                        electionAddress: election.contractAddress,
                      }))
                    }
                  />

                  <AdminButton
                    label="Start Voting"
                    disabled={!privateKey || !canStartVoting}
                    onClick={() =>
                      dispatch(startVoting({
                        privateKey,
                        electionAddress: election.contractAddress,
                      }))
                    }
                  />
{/* 
                  <AdminButton
                    label="End Election"
                    disabled={!privateKey || !canEndElection}
                    onClick={() =>
                      dispatch(endElection({
                        privateKey,
                        electionAddress: election.contractAddress,
                      }))
                    }
                  /> */}

                  {/* <AdminButton
                    label="Declare Result"
                    disabled={!privateKey || !canDeclareResult}
                    onClick={() =>
                      dispatch(declareResults({
                        privateKey,
                        electionAddress: election.contractAddress,
                      }))
                    }
                  /> */}
                </>
              )}

              {/* SUPER ADMIN ACTIONS */}
              {isSuperAdmin && (
                <>
                  <AdminButton
                    label="Deactivate Election"
                    disabled={!privateKey || !canDeactivate}
                    onClick={() =>
                      dispatch(deactivateElection({
                        privateKey,
                        electionAddress: election.contractAddress,
                      }))
                    }
                  />

                  <AdminButton
                    label="Reactivate Election"
                    disabled={!privateKey || !canReactivate}
                    onClick={() =>
                      dispatch(reactivateElection({
                        privateKey,
                        electionAddress: election.contractAddress,
                      }))
                    }
                  />
                </>
              )}
            </div>
          </div>
        )}

        {error && <p className="text-red-400 text-center">{error}</p>}
      </div>
    </div>
  );
};

export default UpcomingElectionDetail;

/* ---------------- UI Helpers ---------------- */

const InfoCard = ({ label, value }) => (
  <div className="bg-slate-900 border border-slate-700 rounded-lg p-6">
    <p className="text-sm text-slate-400">{label}</p>
    <p className="mt-2 font-medium">{value}</p>
  </div>
);

const ActionButton = ({ label, onClick }) => (
  <button
    onClick={onClick}
    className="py-3 border border-blue-500 text-blue-400 hover:bg-blue-500/10"
  >
    {label}
  </button>
);

const AdminButton = ({ label, onClick, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`py-3 border rounded transition ${
      disabled
        ? "border-slate-700 text-slate-500 cursor-not-allowed"
        : "border-slate-600 hover:bg-slate-800"
    }`}
  >
    {label}
  </button>
);
