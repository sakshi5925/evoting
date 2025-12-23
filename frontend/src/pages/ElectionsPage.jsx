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

  useEffect(() => {
    dispatch(getUpcomingElections());
    dispatch(getOngoingElections());
    dispatch(getCompletedElections());
  }, [dispatch]);

  const canManageUsers = ["SUPER_ADMIN", "ELECTION_MANAGER", "ELECTION_AUTHORITY"].includes(
    user?.role
  );

  return (
    <div className="min-h-screen bg-[#0b0f14] text-gray-100">
      {/* Header */}
      <div className="border-b border-white/10 bg-[#0b0f14] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Elections
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Platform-wide election monitoring & control
            </p>
          </div>

          <div className="flex items-center gap-3">
            {canManageUsers && (
              <button
                onClick={() => navigate("/manage-users")}
                className="px-4 py-2 text-sm rounded-md border border-white/10
                           bg-[#0f172a] hover:bg-[#111827] transition"
              >
                Manage Users
              </button>
            )}

            {user?.role === "SUPER_ADMIN" && (
              <button
                onClick={() => navigate("/create-election")}
                className="px-4 py-2 text-sm rounded-md bg-blue-600
                           hover:bg-blue-700 transition font-medium"
              >
                Create Election
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">
        {isLoading && (
          <div className="text-sm text-gray-400">Loading elections…</div>
        )}

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-400">
            {error}
          </div>
        )}

        {!isLoading && !error && (
          <>
            <SectionCard title="Upcoming Elections">
              <ElectionSection data={upcomingElections} />
            </SectionCard>

            <SectionCard title="Ongoing Elections">
              <ElectionSection data={OngoingElections} />
            </SectionCard>

            <SectionCard title="Completed Elections">
              <ElectionSection data={CompletedElections} />
            </SectionCard>
          </>
        )}
      </div>
    </div>
  );
};

const SectionCard = ({ title, children }) => (
  <div className="bg-[#0f172a] border border-white/10 rounded-xl">
    <div className="px-6 py-4 border-b border-white/10">
      <h2 className="text-lg font-medium tracking-tight">{title}</h2>
    </div>
    <div className="p-6">{children}</div>
  </div>
);

export default ElectionsPage;
