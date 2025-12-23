import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { registerCandidate } from "../../redux/slices/candidateSlice";

const RegisterCandidate = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { electionAddress } = useParams();

  const { isLoading, error } = useSelector((state) => state.candidate);

  const [candidateName, setCandidateName] = useState("");
  const [party, setParty] = useState("");
  const [privateKey, setPrivateKey] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!candidateName || !party || !privateKey) {
      alert("All fields are required");
      return;
    }

    const result = await dispatch(
      registerCandidate({
        privateKey,
        electionAddress,
        candidateName,
        party,
      })
    );

    if (registerCandidate.fulfilled.match(result)) {
      alert("Candidate registered successfully");
      navigate(-1);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f14] flex items-center justify-center px-6 py-12 text-gray-100">
      <div className="w-full max-w-lg bg-[#0f172a] border border-white/10 rounded-xl p-8 space-y-8">

        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Candidate Registration
          </h1>

          <p className="text-xs text-gray-400 font-mono break-all">
            Election Address: {electionAddress}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Candidate Name */}
          <Field
            label="Candidate Name"
            placeholder="Your full name"
            value={candidateName}
            onChange={(e) => setCandidateName(e.target.value)}
          />

          {/* Party */}
          <Field
            label="Party / Group"
            placeholder="Party or independent group"
            value={party}
            onChange={(e) => setParty(e.target.value)}
          />

          {/* Private Key */}
          <div>
            <label className="block text-sm text-gray-300 mb-1">
              Wallet Private Key
            </label>
            <input
              type="password"
              value={privateKey}
              onChange={(e) => setPrivateKey(e.target.value)}
              placeholder="Required to sign transaction"
              className="w-full px-4 py-3 rounded-md bg-[#020617]
                         border border-red-500/40 text-gray-200
                         focus:outline-none focus:border-red-400"
              required
            />
            <p className="text-xs text-red-400 mt-2">
              ⚠ This key is used only to sign the transaction and is never stored.
            </p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 rounded-md font-medium transition
              ${
                isLoading
                  ? "bg-gray-700 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
          >
            {isLoading ? "Registering…" : "Register as Candidate"}
          </button>
        </form>

        {/* Error */}
        {error && (
          <p className="text-center text-red-400 text-sm">
            {error}
          </p>
        )}

        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="w-full text-sm text-gray-400 hover:text-gray-200 transition"
        >
          ← Back
        </button>
      </div>
    </div>
  );
};

export default RegisterCandidate;

/* ---------- UI Helper ---------- */

const Field = ({ label, ...props }) => (
  <div>
    <label className="block text-sm text-gray-300 mb-1">
      {label}
    </label>
    <input
      {...props}
      type="text"
      className="w-full px-4 py-3 rounded-md bg-[#020617]
                 border border-white/10 text-gray-200
                 focus:outline-none focus:border-blue-400"
      required
    />
  </div>
);
