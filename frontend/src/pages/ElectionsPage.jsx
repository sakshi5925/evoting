import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import ElectionSection from "../components/election/ElectionSection";
import sampleElections from "../data/sampleElections";

const ElectionsPage = () => {
  const navigate = useNavigate();
  const { allelections, isLoading, error } = useSelector((state) => state.election);
  const { user } = useSelector((state) => state.auth);

  const electionList = allelections.length === 0 ? sampleElections : allelections;
  const now = new Date();

  const upcoming = electionList.filter((e) => new Date(e.ElectionStartTime) > now);
  const ongoing = electionList.filter(
    (e) => new Date(e.ElectionStartTime) <= now && new Date(e.ElectionEndTime) >= now
  );
  const completed = electionList.filter((e) => new Date(e.ElectionEndTime) < now);

  return (
    <div className="bg-[#0d1117] min-h-screen text-white px-6 py-10">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <h1 className="text-4xl font-extrabold mb-4">Elections Overview</h1>

        {user?.role === "admin" && (
          <button
            onClick={() => navigate("/create-election")}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600 shadow-lg hover:scale-105"
          >
            + Create Election
          </button>
        )}
      </div>

      {isLoading && <p className="text-center text-gray-300">Loading...</p>}
      {error && <p className="text-center text-red-400">{error}</p>}

      <div className="max-w-7xl mx-auto mt-10 space-y-16">
        <ElectionSection title="Upcoming Elections" data={upcoming} />
        <ElectionSection title="Ongoing Elections" data={ongoing} />
        <ElectionSection title="Completed Elections" data={completed} />
      </div>
    </div>
  );
};

export default ElectionsPage;
