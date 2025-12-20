import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { createElection } from "../../redux/slices/electionSlice";
import { ElectionManagersList } from "../../redux/slices/roleSlice";

export default function CreateElection() {
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  const [managerLoading, setManagerLoading] = useState(false);
  const [managers, setManagers] = useState([]);

  const [privateKey, setPrivateKey] = useState("");
  const [showKey, setShowKey] = useState(false);

  // ---------------------------
  // Fetch election managers
  // ---------------------------
  const fetchElectionManagers = async () => {
    try {
      setManagerLoading(true);
      const managerList = await dispatch(ElectionManagersList()).unwrap();
      setManagers(Array.isArray(managerList) ? managerList : []);
    } catch (error) {
      console.error("Failed to fetch managers:", error);
      setManagers([]);
    } finally {
      setManagerLoading(false);
    }
  };

  useEffect(() => {
    fetchElectionManagers();
  }, []);

  // ---------------------------
  // Create election
  // ---------------------------
  const handleCreateElection = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!privateKey || privateKey.length < 64) {
      alert("Please enter a valid private key");
      setLoading(false);
      return;
    }

    const form = e.target;

    const electionData =  {
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
        alert("Election created successfully!");
        form.reset();
        setPrivateKey(""); // 
      } else {
        alert("Failed to create election");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-6">
      <div className="w-full max-w-3xl bg-gray-900/60 backdrop-blur-xl border border-gray-700 shadow-2xl rounded-2xl p-10">
        <h1 className="text-4xl font-extrabold text-center text-green-400 mb-10">
          Create New Election
        </h1>

        <form onSubmit={handleCreateElection} className="space-y-6">

          {/* 🔐 Private Key */}
          <div>
            <label className="text-sm font-semibold text-red-400">
              Admin Private Key (required)
            </label>

            <div className="relative mt-1">
              <input
                type={showKey ? "text" : "password"}
                value={privateKey}
                onChange={(e) => setPrivateKey(e.target.value)}
                required
                autoComplete="off"
                className="w-full px-4 py-3 pr-16 rounded-xl bg-gray-800 border border-red-500 text-gray-200"
                placeholder="0x..."
              />

              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 hover:text-white"
              >
                {showKey ? "Hide" : "Show"}
              </button>
            </div>

            <p className="text-xs text-gray-400 mt-2">
              ⚠️ This key is used only to sign this transaction and is never stored.
            </p>
          </div>

          {/* Election Name */}
          <div>
            <label className="text-sm font-semibold text-gray-200">
              Election Name
            </label>
            <input
              type="text"
              name="ElectionName"
              required
              className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-gray-200"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-semibold text-gray-200">
              Description
            </label>
            <textarea
              name="description"
              rows="3"
              className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-gray-200"
            />
          </div>

          {/* Election Manager */}
          <div>
            <label className="text-sm font-semibold text-gray-200">
              Election Manager
            </label>
            <select
              name="electionManager"
              required
              disabled={managerLoading}
              className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-gray-200"
            >
              {managerLoading ? (
                <option>Loading managers...</option>
              ) : managers.length === 0 ? (
                <option>No managers available</option>
              ) : (
                <>
                  <option value="">-- Select Manager --</option>
                  {managers.map((manager) => (
                    <option
                      key={manager._id}
                      value={manager.walletAddress}
                    >
                      {manager.name ?? "Unnamed"} (
                      {manager.walletAddress.slice(0, 6)}...)
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>

          {/* Dates */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-5">

  {/* Election Start */}
  <div>
    <label className="text-sm font-semibold text-gray-200">
      Election Start Date & Time
    </label>
    <input
      type="datetime-local"
      name="ElectionStartTime"
      required
      className="mt-1 w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-gray-200"
    />
    <p className="text-xs text-gray-400 mt-1">
      Voting process begins at this time
    </p>
  </div>

  {/* Election End */}
  <div>
    <label className="text-sm font-semibold text-gray-200">
      Election End Date & Time
    </label>
    <input
      type="datetime-local"
      name="ElectionEndTime"
      required
      className="mt-1 w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-gray-200"
    />
    <p className="text-xs text-gray-400 mt-1">
      Voting automatically stops at this time
    </p>
  </div>

  {/* Registration Deadline */}
  <div>
    <label className="text-sm font-semibold text-gray-200">
      Registration Deadline
    </label>
    <input
      type="datetime-local"
      name="registrationDeadline"
      required
      className="mt-1 w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-gray-200"
    />
    <p className="text-xs text-gray-400 mt-1">
      Last time to register voters & candidates
    </p>
  </div>

</div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-green-600 text-white font-semibold"
          >
            {loading ? "Creating Election..." : "Create Election"}
          </button>
        </form>
      </div>
    </div>
  );
}
