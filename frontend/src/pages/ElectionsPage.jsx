import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import ElectionSection from "../components/election/ElectionSection";
import {
  getUpcomingElections,
  getOngoingElections,
  getCompletedElections,
} from "../redux/slices/electionSlice";

const ElectionsPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);

  const {
    upcomingElections,
    OngoingElections,
    CompletedElections,
    isLoading,
    error,
  } = useSelector((state) => state.election);

  // 🔥 FETCH DATA ON LOAD
  useEffect(() => {
    dispatch(getUpcomingElections());
    dispatch(getOngoingElections());
    dispatch(getCompletedElections());
  }, [dispatch]);

  return (
    <div className="bg-[#0d1117] min-h-screen text-white px-6 py-10">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <h1 className="text-4xl font-extrabold mb-4">
          Elections Overview
        </h1>

        {/* Manage Users → Admin + Manager + Authority */}
        {["SUPER_ADMIN", "ELECTION_MANAGER", "ELECTION_AUTHORITY"].includes(user?.role) && (
          <button
            onClick={() => navigate("/manage-users")}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600"
          >
            Manage Users
          </button>
        )}

        {/* Create Election → ONLY Super Admin */}
        {user?.role === "SUPER_ADMIN" && (
          <button
            onClick={() => navigate("/create-election")}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600"
          >
            + Create Election
          </button>
        )}

      </div>

      {isLoading && <p className="text-center">Loading...</p>}
      {error && <p className="text-center text-red-400">{error}</p>}

      <div className="max-w-7xl mx-auto mt-10 space-y-16">
        <ElectionSection
          title="Upcoming Elections"
          data={upcomingElections}
        />

        <ElectionSection
          title="Ongoing Elections"
          data={OngoingElections}
        />

        <ElectionSection
          title="Completed Elections"
          data={CompletedElections}
        />
      </div>
    </div>
  );
};

export default ElectionsPage;
