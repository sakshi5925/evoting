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

  const { pendingCandidates, isLoading, error } = useSelector((state) => state.candidate);

  const { users } = useSelector((state) => state.role);
  const { user } = useSelector((state) => state.auth);

  const [privateKey, setPrivateKey] = useState("");

  /* ---------------- ROLES ---------------- */
  const isManager = user?.role === "ELECTION_MANAGER";
  const isAuthority = user?.role === "ELECTION_AUTHORITY";

  /* ---------------- FETCH DATA ---------------- */
  useEffect(() => {
    dispatch(getPendingCandidates({ electionAddress }));
    dispatch(getAllUsers());
  }, [dispatch, electionAddress]);

  /* ---------------- GUARD ---------------- */
  if (!isManager && !isAuthority) {
    return (
      <p className="text-center text-red-400 mt-20">
        Unauthorized access
      </p>
    );
  }

  /* ---------------- HANDLERS ---------------- */
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

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-6 py-10">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-yellow-400">
            Validate Candidates
          </h1>

          <button
            onClick={() => navigate(-1)}
            className="text-sm text-slate-400 hover:text-slate-200"
          >
            ← Back
          </button>
        </div>

        {/* PRIVATE KEY */}
        <input
          type="password"
          placeholder="Private key (manager / authority)"
          value={privateKey}
          onChange={(e) => setPrivateKey(e.target.value)}
          className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded"
        />

        {/* CONTENT */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* LEFT — PENDING CANDIDATES */}
          <section className="bg-slate-900 border border-slate-700 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4 text-blue-400">
              Pending Candidates
            </h2>

            {pendingCandidates.length === 0 && (
              <p className="text-slate-400 text-sm">
                No pending candidates
              </p>
            )}

            <div className="space-y-4">
              {pendingCandidates.map((c) => (
                <div
                  key={c.candidateId}
                  className="border border-slate-700 rounded-lg p-4 space-y-3"
                >
                  <div>
                    <p className="font-medium">{c.name}</p>
                    <p className="text-sm text-slate-400">{c.party}</p>
                    <p className="text-xs text-slate-500 break-all">
                      {c.candidateAddress}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() =>
                        handleValidate(c.candidateId, true)
                      }
                      className="flex-1 py-2 rounded bg-green-600 hover:bg-green-700 text-sm"
                    >
                      Approve
                    </button>

                    <button
                      onClick={() =>
                        handleValidate(c.candidateId, false)
                      }
                      className="flex-1 py-2 rounded bg-red-600 hover:bg-red-700 text-sm"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </section>


          {/* RIGHT — USERS → ASSIGN VOTER */}
          <section className="bg-slate-900 border border-slate-700 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4 text-green-400">
              Assign Voter Role
            </h2>

            <div className="space-y-3 max-h-[450px] overflow-y-auto pr-2">
              {users
                .filter((u) =>
                  typeof u.role === "string" &&
                  (u.role === "voter" || u.role === "VOTER")
                )
                .map((u) => {
                  const isDbVoter = u.role === "voter";

                  return (
                    <div
                      key={u.walletAddress}
                      className="flex justify-between items-center border border-slate-700 rounded-lg p-3"
                    >
                      <div>
                        <p className="text-sm break-all">
                          {u.walletAddress}
                        </p>
                        <p className="text-xs text-slate-400">
                          Role: {u.role}
                        </p>
                        <p className="text-xs text-slate-400">
                          VoterID: {u.VoterID}
                        </p>
                        <p className="text-xs text-slate-400">
                          DOB: {u.DOB}
                        </p>
                      </div>

                      {isDbVoter && (
                        <button
                          onClick={() => handleAssignVoter(u.walletAddress)}
                          className="px-3 py-1 text-xs rounded bg-blue-600 hover:bg-blue-700"
                        >
                          Make Voter
                        </button>
                      )}
                    </div>
                  );
                })}
            </div>

          </section>

        </div>

        {isLoading && (
          <p className="text-center text-blue-400">
            Processing…
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
