import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";

import {
  getPendingCandidates,
  validateCandidate,
} from "../../redux/slices/candidateSlice";

import {
  getAllUsers,
  assignRole,
} from "../../redux/slices/roleSlice";

const ValidateCandidates = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { electionAddress } = useParams();

  const { pendingCandidates = [], isLoading, error } = useSelector(
    (state) => state.candidate
  );

  const { users = [] } = useSelector((state) => state.role);
  const { user } = useSelector((state) => state.auth);

  const [privateKey, setPrivateKey] = useState("");

  /* ---------- ROLES ---------- */
  const isManager = user?.role === "ELECTION_MANAGER";
  const isAuthority = user?.role === "ELECTION_AUTHORITY";

  /* ---------- FETCH ---------- */
  useEffect(() => {
    dispatch(getPendingCandidates({ electionAddress }));
    dispatch(getAllUsers());
  }, [dispatch, electionAddress]);

  /* ---------- GUARD ---------- */
  if (!isManager && !isAuthority) {
    return (
      <div className="min-h-screen bg-[#0b0f14] flex items-center justify-center text-red-400">
        Unauthorized access
      </div>
    );
  }

  /* ---------- HANDLERS ---------- */
  const handleValidate = async (candidateId, isValid) => {
    if (!privateKey) {
      alert("Private key required");
      return;
    }

    await dispatch(
      validateCandidate({
        privateKey,
        electionAddress,
        candidateId,
        isValid,
      })
    );

    dispatch(getPendingCandidates({ electionAddress }));
  };

  const handleAssignVoter = (walletAddress) => {
    dispatch(assignRole({ walletAddress, role: "VOTER" }));
  };

  return (
    <div className="min-h-screen bg-[#0b0f14] px-6 py-12 text-gray-100">
      <div className="max-w-7xl mx-auto space-y-10">

        {/* Header */}
        <div>
          <button
            onClick={() => navigate(-1)}
            className="mb-3 text-sm text-gray-400 hover:text-gray-200 transition"
          >
            ← Back
          </button>

          <h1 className="text-3xl font-semibold tracking-tight">
            Validate Candidates
          </h1>

          <p className="text-sm text-gray-400 mt-1">
            Election Address:{" "}
            <span className="font-mono text-xs">
              {electionAddress}
            </span>
          </p>
        </div>

        {/* Security */}
        <div className="bg-red-500/5 border border-red-500/30 rounded-xl p-6">
          <h2 className="text-sm font-medium text-red-400 mb-3">
            Security Authorization
          </h2>

          <input
            type="password"
            placeholder="Private key (required)"
            value={privateKey}
            onChange={(e) => setPrivateKey(e.target.value)}
            className="w-full px-4 py-3 rounded-md bg-[#020617]
                       border border-white/10 text-gray-200"
          />
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Pending Candidates */}
          <section className="bg-[#0f172a] border border-white/10 rounded-xl p-6">
            <h2 className="text-lg font-medium text-blue-400 mb-4">
              Pending Candidates
            </h2>

            {pendingCandidates.length === 0 && (
              <p className="text-sm text-gray-400">
                No pending candidates
              </p>
            )}

            <div className="space-y-4">
              {pendingCandidates.map((c) => (
                <div
                  key={c.candidateId}
                  className="border border-white/10 rounded-lg p-4 space-y-3"
                >
                  <div>
                    <p className="font-medium">{c.name}</p>
                    <p className="text-sm text-gray-400">
                      Party: {c.party}
                    </p>
                    <p className="text-xs text-gray-500 font-mono break-all">
                      {c.candidateAddress}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <ApproveButton
                      onClick={() =>
                        handleValidate(c.candidateId, true)
                      }
                    />
                    <RejectButton
                      onClick={() =>
                        handleValidate(c.candidateId, false)
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Assign Voter */}
          <section className="bg-[#0f172a] border border-white/10 rounded-xl p-6">
            <h2 className="text-lg font-medium text-green-400 mb-4">
              Assign Voter Role
            </h2>

            <div className="space-y-3 max-h-[460px] overflow-y-auto pr-2">
              {users
                .filter(
                  (u) =>
                    typeof u.role === "string" &&
                    (u.role === "voter" || u.role === "VOTER")
                )
                .map((u) => (
                  <div
                    key={u.walletAddress}
                    className="flex justify-between items-center
                               border border-white/10 rounded-lg p-3"
                  >
                    <div>
                      <p className="text-xs font-mono break-all">
                        {u.walletAddress}
                      </p>
                      <p className="text-xs text-gray-400">
                        Role: {u.role}
                      </p>
                      <p className="text-xs text-gray-400">
                        Voter ID: {u.VoterID}
                      </p>
                      <p className="text-xs text-gray-400">
                        DOB: {u.DOB}
                      </p>
                    </div>

                    {u.role === "voter" && (
                      <button
                        onClick={() =>
                          handleAssignVoter(u.walletAddress)
                        }
                        className="px-3 py-1.5 text-xs rounded-md
                                   bg-blue-600 hover:bg-blue-700 transition"
                      >
                        Make Voter
                      </button>
                    )}
                  </div>
                ))}
            </div>
          </section>

        </div>

        {/* Status */}
        {isLoading && (
          <p className="text-center text-blue-400">
            Processing request…
          </p>
        )}

        {error && (
          <p className="text-center text-red-400">
            {error}
          </p>
        )}
      </div>
    </div>
  );
};

export default ValidateCandidates;

/* ---------- UI Helpers ---------- */

const ApproveButton = ({ onClick }) => (
  <button
    onClick={onClick}
    className="flex-1 py-2 rounded-md text-sm
               bg-green-600 hover:bg-green-700 transition"
  >
    Approve
  </button>
);

const RejectButton = ({ onClick }) => (
  <button
    onClick={onClick}
    className="flex-1 py-2 rounded-md text-sm
               bg-red-600 hover:bg-red-700 transition"
  >
    Reject
  </button>
);
