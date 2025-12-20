import React from "react";
import { useNavigate } from "react-router-dom";

const ElectionCard = ({ election }) => {
  const navigate = useNavigate();

  //  Prefer DB dates (already validated)
  const start = new Date(election.startdate);
  const end = new Date(election.enddate);
  const now = new Date();

  let statusLabel = "Upcoming";
  let color = "bg-blue-500";

  if (now >= start && now <= end) {
    statusLabel = "Ongoing";
    color = "bg-yellow-500";
  } else if (now > end) {
    statusLabel = "Completed";
    color = "bg-green-600";
  }

  return (
    <div
      onClick={() => navigate(`/election/${election._id}`)}
      className="cursor-pointer bg-gray-900/70 border border-gray-700 rounded-2xl p-6 shadow-lg backdrop-blur-xl hover:-translate-y-2 hover:shadow-green-500/40 transition-all"
    >
      {/* Status Badge */}
      <span
        className={`inline-block px-3 py-1 text-sm rounded-lg ${color} text-white font-semibold`}
      >
        {statusLabel}
      </span>

      {/* Name */}
      <h3 className="text-2xl font-bold mt-4">
        {election.ElectionName}
      </h3>

      {/* Description */}
      <p className="text-gray-300 mt-3 line-clamp-3">
        {election.description}
      </p>

      {/* Dates */}
      <p className="text-gray-400 text-sm mt-4">
        📅 {start.toDateString()} — {end.toDateString()}
      </p>
    </div>
  );
};

export default ElectionCard;
