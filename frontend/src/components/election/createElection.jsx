import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { createElection } from "../../redux/slices/electionSlice";
import axios from "axios";

export default function CreateElection() {
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  const [managerLoading, setManagerLoading] = useState(false);
  const [managers, setManagers] = useState([]);

  // Fetch election managers
  const fetchElectionManagers = async () => {
    try {
      setManagerLoading(true);
      const response = await axios.get("/api/roles/election-managers");

      const managerList = Array.isArray(response.data)
        ? response.data
        : response.data.managers;

      setManagers(managerList || []);
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

  const handleCreateElection = async (e) => {
    e.preventDefault();
    setLoading(true);

    const form = e.target;

    const electionData = {
      ElectionName: form.ElectionName.value,
      description: form.description.value,
      ElectionStartTime: Math.floor(new Date(form.ElectionStartTime.value).getTime() / 1000),
      ElectionEndTime: Math.floor(new Date(form.ElectionEndTime.value).getTime() / 1000),
      registrationDeadline: Math.floor(new Date(form.registrationDeadline.value).getTime() / 1000),
      electionManager: form.electionManager.value,
    };

    try {
      const result = await dispatch(createElection(electionData));

      if (createElection.fulfilled.match(result)) {
        alert("Election created successfully!");
        form.reset();
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

        <h1 className="text-4xl font-extrabold text-center text-green-400 mb-10 drop-shadow-[0_0_10px_rgba(0,255,150,0.35)]">
          Create New Election
        </h1>

        <form onSubmit={handleCreateElection} className="space-y-6">

          {/* Election Name */}
          <div>
            <label className="text-sm font-semibold text-gray-200">Election Name</label>
            <input
              type="text"
              name="ElectionName"
              required
              placeholder="Enter election name"
              className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-gray-200 
              focus:ring-2 focus:ring-green-500 outline-none transition"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-semibold text-gray-200">Description</label>
            <textarea
              name="description"
              rows="3"
              placeholder="Describe the election"
              className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-gray-200 
              focus:ring-2 focus:ring-green-500 outline-none transition"
            />
          </div>

          {/* Election Manager */}
          <div>
            <label className="text-sm font-semibold text-gray-200">Election Manager</label>
            <select
              name="electionManager"
              required
              disabled={managerLoading}
              className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-gray-200 
              focus:ring-2 focus:ring-green-500 outline-none transition disabled:bg-gray-700"
            >
              {managerLoading ? (
                <option>Loading managers...</option>
              ) : managers.length === 0 ? (
                <option>No managers available</option>
              ) : (
                <>
                  <option value="">-- Select Manager --</option>
                  {managers.map((manager) => (
                    <option key={manager.address} value={manager.address}>
                      {manager.name} ({manager.address.slice(0, 6)}...)
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            <div>
              <label className="text-sm font-semibold text-gray-200">Start Time</label>
              <input
                type="datetime-local"
                name="ElectionStartTime"
                required
                className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-gray-200 
                focus:ring-2 focus:ring-green-500 outline-none"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-200">End Time</label>
              <input
                type="datetime-local"
                name="ElectionEndTime"
                required
                className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-gray-200 
                focus:ring-2 focus:ring-green-500 outline-none"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-200">Registration Deadline</label>
              <input
                type="datetime-local"
                name="registrationDeadline"
                required
                className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-gray-200 
                focus:ring-2 focus:ring-green-500 outline-none"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600 
            text-white font-semibold text-lg shadow-md hover:shadow-green-500/40 
            hover:scale-[1.02] transition disabled:bg-gray-500 disabled:scale-100"
          >
            {loading ? "Creating Election..." : "Create Election"}
          </button>
        </form>
      </div>
    </div>
  );
}
