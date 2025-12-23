import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import {
  startCandidateRegistration,
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

  /* ---------- ROLES ---------- */
  const isSuperAdmin = user?.role === "SUPER_ADMIN";
  const isManager = user?.role === "ELECTION_MANAGER";
  const isAuthority = user?.role === "ELECTION_AUTHORITY";

  /* ---------- FETCH ---------- */
  useEffect(() => {
    if (!upcomingElections.length) {
      dispatch(getUpcomingElections());
    }
  }, [dispatch, upcomingElections.length]);

  /* ---------- FIND ---------- */
  useEffect(() => {
    if (!id || !upcomingElections.length) return;
    setElection(upcomingElections.find((e) => e._id === id) || null);
  }, [id, upcomingElections]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0b0f14] flex items-center justify-center text-gray-400">
        Loading election…
      </div>
    );
  }

  if (!election) {
    return (
      <div className="min-h-screen bg-[#0b0f14] flex items-center justify-center text-gray-400">
        Election not found
      </div>
    );
  }

  /* ---------- HELPERS ---------- */
  const status = election.status;
  const deadline = new Date(election.registrationDeadline * 1000);

  const isRegistrationOpen =
    status === "Registration" && Date.now() < deadline.getTime();

  const canStartRegistration = isManager && status === "Created";
  const canValidateCandidates =
    (isManager || isAuthority) && status === "Registration";
  const canDeactivate = isSuperAdmin && election.isActive;
  const canReactivate = isSuperAdmin && !election.isActive;

  return (
    <div className="min-h-screen bg-[#0b0f14] px-6 py-12 text-gray-100">
      <div className="max-w-6xl mx-auto space-y-10">

        {/* Header */}
        <div>
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
            Upcoming Election · Status:{" "}
            <span className="text-blue-400 font-medium">{status}</span>
          </p>
        </div>

        {/* Summary */}
        <div className="bg-[#0f172a] border border-white/10 rounded-xl p-6">
          <p className="text-gray-300">{election.description}</p>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <Stat
              label="Start Date"
              value={new Date(election.startdate).toDateString()}
            />
            <Stat
              label="End Date"
              value={new Date(election.enddate).toDateString()}
            />
            <Stat
              label="Registration Deadline"
              value={deadline.toDateString()}
              highlight
            />
          </div>
        </div>

        {/* Participation */}
        {isRegistrationOpen && (
          <div className="bg-[#0f172a] border border-white/10 rounded-xl p-6">
            <h2 className="text-lg font-medium mb-4">
              Participation
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <PrimaryButton
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
                  } else {
                    alert(result.payload || "Registration failed");
                  }
                }}
              />

              <PrimaryButton
                label="Register as Candidate"
                onClick={() =>
                  navigate(
                    `/register-candidate/${election.contractAddress}`
                  )
                }
              />
            </div>
          </div>
        )}

        {/* Administrative Controls */}
        {(isManager || isAuthority || isSuperAdmin) && (
          <div className="bg-red-500/5 border border-red-500/30 rounded-xl p-6 space-y-6">
            <h2 className="text-lg font-medium text-red-400">
              Administrative Controls
            </h2>

            <input
              type="password"
              placeholder="Private key (required)"
              value={privateKey}
              onChange={(e) => setPrivateKey(e.target.value)}
              className="w-full px-4 py-3 rounded-md bg-[#020617]
                         border border-white/10 text-gray-200"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

              {isManager && (
                <AdminButton
                  label="Start Registration"
                  disabled={!privateKey || !canStartRegistration}
                  onClick={() =>
                    dispatch(
                      startCandidateRegistration({
                        privateKey,
                        electionAddress: election.contractAddress,
                      })
                    )
                  }
                />
              )}

              {(isManager || isAuthority) && (
                <AdminButton
                  label="Validate Candidates"
                  disabled={!canValidateCandidates}
                  onClick={() =>
                    navigate(
                      `/validate-candidates/${election.contractAddress}`
                    )
                  }
                />
              )}

              {isSuperAdmin && (
                <>
                  <DangerButton
                    label="Deactivate Election"
                    disabled={!privateKey || !canDeactivate}
                    onClick={() =>
                      dispatch(
                        deactivateElection({
                          privateKey,
                          electionAddress: election.contractAddress,
                        })
                      )
                    }
                  />

                  <AdminButton
                    label="Reactivate Election"
                    disabled={!privateKey || !canReactivate}
                    onClick={() =>
                      dispatch(
                        reactivateElection({
                          privateKey,
                          electionAddress: election.contractAddress,
                        })
                      )
                    }
                  />
                </>
              )}
            </div>
          </div>
        )}

        {error && (
          <p className="text-center text-red-400 text-sm">
            {error}
          </p>
        )}
      </div>
    </div>
  );
};

export default UpcomingElectionDetail;

/* ---------- UI HELPERS ---------- */

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

const PrimaryButton = ({ label, onClick }) => (
  <button
    onClick={onClick}
    className="py-3 rounded-md border border-blue-500/40
               text-blue-400 hover:bg-blue-500/10 transition font-medium"
  >
    {label}
  </button>
);

const AdminButton = ({ label, onClick, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`py-3 rounded-md border transition font-medium
      ${
        disabled
          ? "border-white/10 text-gray-500 cursor-not-allowed"
          : "border-white/20 text-gray-200 hover:bg-white/5"
      }`}
  >
    {label}
  </button>
);

const DangerButton = ({ label, onClick, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`py-3 rounded-md border transition font-medium
      ${
        disabled
          ? "border-red-500/20 text-red-500/40 cursor-not-allowed"
          : "border-red-500 text-red-400 hover:bg-red-500/10"
      }`}
  >
    {label}
  </button>
);
