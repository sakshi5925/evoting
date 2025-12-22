import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import {
  startCandidateRegistration,
  startVoting,
  deactivateElection,
  reactivateElection,
  getUpcomingElections,
} from "../../../redux/slices/electionSlice";

import { registerVoter } from "../../../redux/slices/voteSlice";

const UpcomingElectionDetail = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  const { user } = useSelector((state) => state.auth);
  const { upcomingElections = [], isLoading, error } =
    useSelector((state) => state.election);

  const [election, setElection] = useState(null);
  const [privateKey, setPrivateKey] = useState("");

  /* ---------------- ROLES ---------------- */
  const isSuperAdmin = user?.role === "SUPER_ADMIN";
  const isManager = user?.role === "ELECTION_MANAGER";
  const isAuthority = user?.role === "ELECTION_AUTHORITY";

  /* ---------------- FETCH ELECTIONS ---------------- */
  useEffect(() => {
    if (!upcomingElections.length) {
      dispatch(getUpcomingElections());
    }
  }, [dispatch, upcomingElections.length]);

  /* ---------------- FIND ELECTION ---------------- */
  useEffect(() => {
    if (!id || !upcomingElections.length) return;
    setElection(upcomingElections.find((e) => e._id === id) || null);
  }, [id, upcomingElections]);

  if (isLoading) {
    return <p className="text-center text-blue-400 mt-20">Loading…</p>;
  }

  if (!election) {
    return <p className="text-center text-gray-400 mt-20">Election not found</p>;
  }

  /* ---------------- HELPERS ---------------- */
  const status = election.status;
  const deadline = new Date(election.registrationDeadline * 1000);

  const canStartRegistration = isManager && status === "Created";
  const canStartVoting = isManager && status === "Registration";
  const canValidateCandidates = (isManager || isAuthority) && status === "Registration";
  const canDeactivate = isSuperAdmin && election.isActive;
  const canReactivate = isSuperAdmin && !election.isActive;

  const isRegistrationOpen =
    status === "Registration" && Date.now() < deadline.getTime();

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-6 py-12">
      <div className="max-w-6xl mx-auto space-y-10">

        {/* BACK */}
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-slate-400 hover:text-slate-200"
        >
          ← Back to Elections
        </button>

        {/* HEADER */}
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-8 space-y-3">
          <h1 className="text-3xl font-semibold">{election.name}</h1>
          <p className="text-slate-400">{election.description}</p>

          <span className="inline-block px-3 py-1 text-xs font-medium rounded-full border border-blue-400 text-blue-400">
            Status: {status}
          </span>
        </div>

        {/* DATES */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <InfoCard label="Start Date" value={new Date(election.startdate).toDateString()} />
          <InfoCard label="End Date" value={new Date(election.enddate).toDateString()} />
          <InfoCard label="Registration Deadline" value={deadline.toDateString()} />
        </div>

        {/* PARTICIPATION */}
        {isRegistrationOpen && (
          <section className="bg-slate-900 border border-slate-700 rounded-xl p-8">
            <h2 className="text-lg font-semibold mb-6">Participation</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ActionButton
                label="Register as Voter"
                onClick={async () => {
                  if (!user?.walletAddress) {
                    alert("Wallet address not found");
                    return;
                  }

                  const result = await dispatch(
                    registerVoter({ walletAddress: user.walletAddress })
                  );

                
                  if (registerVoter.fulfilled.match(result)) {
                    alert(result.payload.message); 
                  }

                  
                  if (registerVoter.rejected.match(result)) {
                    alert(result.payload || "Failed to register voter");
                  }
                }}
              />
              <ActionButton
                label="Register as Candidate"
                onClick={() =>
                  navigate(`/register-candidate/${election.contractAddress}`)
                }
              />
            </div>
          </section>
        )}

        {/* ADMIN / MANAGER / AUTHORITY */}
        {(isManager || isAuthority || isSuperAdmin) && (
          <section className="bg-slate-900 border border-red-500/40 rounded-xl p-8 space-y-6">
            <h2 className="text-lg font-semibold text-red-400">
              Administrative Controls
            </h2>

            {/* PRIVATE KEY */}
            <input
              type="password"
              placeholder="Private key (required for blockchain actions)"
              value={privateKey}
              onChange={(e) => setPrivateKey(e.target.value)}
              className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg focus:border-red-400 focus:outline-none"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

              {/* MANAGER */}
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
                </>
              )}

              {/* VALIDATE */}
              {(isManager || isAuthority) && (
                <AdminButton
                  label="Validate Candidates"
                  disabled={!canValidateCandidates}
                  onClick={() =>
                    navigate(`/validate-candidates/${election.contractAddress}`)
                  }
                />
              )}

              {/* SUPER ADMIN */}
              {isSuperAdmin && (
                <>
                  <AdminButton
                    label="Deactivate Election"
                    disabled={!privateKey || !canDeactivate}
                    danger
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
          </section>
        )}

        {error && (
          <p className="text-center text-red-400 text-sm">{error}</p>
        )}
      </div>
    </div>
  );
};

export default UpcomingElectionDetail;

/* ---------------- UI COMPONENTS ---------------- */

const InfoCard = ({ label, value }) => (
  <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
    <p className="text-sm text-slate-400">{label}</p>
    <p className="mt-2 font-medium">{value}</p>
  </div>
);

const ActionButton = ({ label, onClick }) => (
  <button
    onClick={onClick}
    className="py-3 rounded-lg border border-blue-500 text-blue-400 hover:bg-blue-500/10 transition font-medium"
  >
    {label}
  </button>
);

const AdminButton = ({ label, onClick, disabled, danger }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`py-3 rounded-lg font-medium transition border
      ${disabled
        ? "border-slate-700 text-slate-500 cursor-not-allowed"
        : danger
          ? "border-red-500 text-red-400 hover:bg-red-500/10"
          : "border-slate-600 text-slate-200 hover:bg-slate-800"
      }`}
  >
    {label}
  </button>
);
