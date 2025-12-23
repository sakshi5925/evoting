import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import { createElection } from "../../redux/slices/electionSlice";
import { ElectionManagersList } from "../../redux/slices/roleSlice";

export default function CreateElection() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [managerLoading, setManagerLoading] = useState(false);
  const [managers, setManagers] = useState([]);

  const [privateKey, setPrivateKey] = useState("");
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    fetchElectionManagers();
  }, []);

  const fetchElectionManagers = async () => {
    try {
      setManagerLoading(true);
      const list = await dispatch(ElectionManagersList()).unwrap();
      setManagers(Array.isArray(list) ? list : []);
    } catch {
      setManagers([]);
    } finally {
      setManagerLoading(false);
    }
  };

  const handleCreateElection = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!privateKey || privateKey.length < 64) {
      alert("Invalid private key");
      setLoading(false);
      return;
    }

    const form = e.target;

    const electionData = {
      privateKey,
      ElectionName: form.ElectionName.value,
      description: form.description.value,
      ElectionStartTime: Math.floor(
        new Date(form.ElectionStartTime.value).getTime() / 1000
      ),
      ElectionEndTime: Math.floor(
        new Date(form.ElectionEndTime.value).getTime() / 1000
      ),
      registrationDeadline: Math.floor(
        new Date(form.registrationDeadline.value).getTime() / 1000
      ),
      electionManager: form.electionManager.value,
    };

    try {
      const result = await dispatch(createElection(electionData));
      if (createElection.fulfilled.match(result)) {
        alert("Election created successfully");
        form.reset();
        setPrivateKey("");
        navigate(-1);
      } else {
        alert("Failed to create election");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f14] px-6 py-12 text-gray-100">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-3 inline-flex items-center gap-2 text-sm text-gray-400
                       hover:text-gray-200 transition"
          >
            ← Back
          </button>

          <h1 className="text-3xl font-semibold tracking-tight">
            Create Election
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Configure election metadata, timeline, and management access
          </p>
        </div>

        <form
          onSubmit={handleCreateElection}
          className="bg-[#0f172a] border border-white/10 rounded-xl p-8 space-y-8"
        >
          {/* Security Section */}
          <div>
            <h2 className="text-sm font-medium text-gray-300 mb-3">
              Security Authorization
            </h2>

            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                value={privateKey}
                onChange={(e) => setPrivateKey(e.target.value)}
                required
                autoComplete="off"
                placeholder="Admin private key"
                className="w-full px-4 py-3 pr-16 rounded-md bg-[#020617]
                           border border-red-500/40 text-gray-200"
              />

              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-4 top-1/2 -translate-y-1/2
                           text-xs text-gray-400 hover:text-gray-200"
              >
                {showKey ? "Hide" : "Show"}
              </button>
            </div>

            <p className="text-xs text-red-400 mt-2">
              This private key is used only for signing and is never stored.
            </p>
          </div>

          <Divider />

          {/* Election Details */}
          <Section title="Election Details">
            <Input label="Election Name" name="ElectionName" required />
            <Textarea label="Description" name="description" />
          </Section>

          <Divider />

          {/* Manager */}
          <Section title="Election Management">
            <Select
              label="Election Manager"
              name="electionManager"
              disabled={managerLoading}
            >
              {managerLoading ? (
                <option>Loading managers...</option>
              ) : managers.length === 0 ? (
                <option>No managers available</option>
              ) : (
                <>
                  <option value="">Select manager</option>
                  {managers.map((m) => (
                    <option key={m._id} value={m.walletAddress}>
                      {m.name || "Unnamed"} ({m.walletAddress.slice(0, 6)}…)
                    </option>
                  ))}
                </>
              )}
            </Select>
          </Section>

          <Divider />

          {/* Timeline */}
          <Section title="Election Timeline">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <DateInput
                label="Start Time"
                name="ElectionStartTime"
                help="Voting begins"
              />
              <DateInput
                label="End Time"
                name="ElectionEndTime"
                help="Voting stops automatically"
              />
              <DateInput
                label="Registration Deadline"
                name="registrationDeadline"
                help="Last registration time"
              />
            </div>
          </Section>

          {/* Actions */}
          <div className="pt-4 flex gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-1/3 py-3 rounded-md border border-white/10
                         text-gray-300 hover:bg-white/5 transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="w-2/3 py-3 rounded-md bg-blue-600
                         hover:bg-blue-700 transition font-medium"
            >
              {loading ? "Creating election..." : "Create Election"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ---------- Reusable UI ---------- */

const Section = ({ title, children }) => (
  <div className="space-y-5">
    <h3 className="text-sm font-medium text-gray-300">{title}</h3>
    {children}
  </div>
);

const Divider = () => (
  <div className="border-t border-white/10" />
);

const Input = ({ label, ...props }) => (
  <div>
    <label className="text-sm text-gray-300">{label}</label>
    <input
      {...props}
      className="mt-1 w-full px-4 py-3 rounded-md bg-[#020617]
                 border border-white/10 text-gray-200"
    />
  </div>
);

const Textarea = ({ label, ...props }) => (
  <div>
    <label className="text-sm text-gray-300">{label}</label>
    <textarea
      {...props}
      rows="3"
      className="mt-1 w-full px-4 py-3 rounded-md bg-[#020617]
                 border border-white/10 text-gray-200"
    />
  </div>
);

const Select = ({ label, children, ...props }) => (
  <div>
    <label className="text-sm text-gray-300">{label}</label>
    <select
      {...props}
      required
      className="mt-1 w-full px-4 py-3 rounded-md bg-[#020617]
                 border border-white/10 text-gray-200"
    >
      {children}
    </select>
  </div>
);

const DateInput = ({ label, help, ...props }) => (
  <div>
    <label className="text-sm text-gray-300">{label}</label>
    <input
      type="datetime-local"
      {...props}
      required
      className="mt-1 w-full px-4 py-3 rounded-md bg-[#020617]
                 border border-white/10 text-gray-200"
    />
    <p className="text-xs text-gray-500 mt-1">{help}</p>
  </div>
);
