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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-xl p-8 space-y-6">

        <h1 className="text-2xl font-semibold text-center text-green-400">
          Candidate Registration
        </h1>

        <p className="text-xs text-slate-400 break-all text-center">
          Election Contract: {electionAddress}
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Candidate Name */}
          <div>
            <label className="block text-sm text-slate-400 mb-1">
              Candidate Name
            </label>
            <input
              type="text"
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
              className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded focus:outline-none focus:border-green-400"
              placeholder="Enter your name"
              required
            />
          </div>

          {/* Party */}
          <div>
            <label className="block text-sm text-slate-400 mb-1">
              Party / Group
            </label>
            <input
              type="text"
              value={party}
              onChange={(e) => setParty(e.target.value)}
              className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded focus:outline-none focus:border-green-400"
              placeholder="Enter party name"
              required
            />
          </div>

          {/* Private Key */}
          <div>
            <label className="block text-sm text-slate-400 mb-1">
              Wallet Private Key
            </label>
            <input
              type="password"
              value={privateKey}
              onChange={(e) => setPrivateKey(e.target.value)}
              className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded focus:outline-none focus:border-red-400"
              placeholder="Required to sign transaction"
              required
            />
            <p className="text-xs text-red-400 mt-1">
              ⚠ Never share your private key with anyone
            </p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 rounded font-semibold transition ${
              isLoading
                ? "bg-slate-700 cursor-not-allowed"
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
          className="w-full text-sm text-slate-400 hover:text-slate-200 mt-2"
        >
          ← Back
        </button>
      </div>
    </div>
  );
};

export default RegisterCandidate;
