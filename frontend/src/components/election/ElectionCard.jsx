import React from "react";
import { useNavigate } from "react-router-dom";

const ElectionCard = ({ election }) => {
  const navigate = useNavigate();

  const start = new Date(election.ElectionStartTime);
  const end = new Date(election.ElectionEndTime);
  const now = new Date();

  let status = "Upcoming";
  let color = "bg-blue-500";

  if (start <= now && end >= now) {
    status = "Ongoing";
    color = "bg-yellow-500";
  }
  if (end < now) {
    status = "Completed";
    color = "bg-green-600";
  }

  return (
    <div
      onClick={() => navigate(`/election/${election._id}`)}
      className="cursor-pointer bg-gray-900/70 border border-gray-700 rounded-2xl p-6 shadow-lg backdrop-blur-xl hover:-translate-y-2 hover:shadow-green-500/40 transition-all"
    >
      <span className={`px-3 py-1 text-sm rounded-lg ${color} text-white font-semibold`}>
        {status}
      </span>

      <h3 className="text-2xl font-bold mt-4">{election.ElectionName}</h3>

      <p className="text-gray-300 mt-3">
        {election.description}
      </p>

      <p className="text-gray-400 text-sm mt-4">
        📅 {start.toDateString()} — {end.toDateString()}
      </p>
    </div>
  );
};

export default ElectionCard;
