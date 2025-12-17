import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import UpcomingElectionDetail from "../components/election/details/UpcomingElectionDetail";
import OngoingElectionDetail from "../components/election/details/OngoingElectionDetail";
import CompletedElectionDetail from "../components/election/details/CompletedElectionDetail";
import { getAllElections } from "../redux/slices/electionSlice";

const ElectionDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();

  const { allelections, isLoading, error } = useSelector(
    (state) => state.election
  );

  /* ---------------- Fetch only if needed ---------------- */
  useEffect(() => {
    if (!Array.isArray(allelections) || !allelections.length) {
      dispatch(getAllElections());
    }
  }, [dispatch, allelections]);

  /* ---------------- SAFE ARRAY ---------------- */
  const electionsArray = Array.isArray(allelections) ? allelections : [];

  const election = electionsArray.find((e) => e._id === id);

  /* ---------------- Loading ---------------- */
  if (isLoading && !election) {
    return (
      <div className="min-h-screen bg-[#0d1117] text-white flex items-center justify-center">
        Loading election details…
      </div>
    );
  }

  /* ---------------- Error ---------------- */
  if (error) {
    return (
      <div className="min-h-screen bg-[#0d1117] text-red-400 flex items-center justify-center">
        {error}
      </div>
    );
  }

  /* ---------------- Not Found ---------------- */
  if (!election) {
    return (
      <div className="min-h-screen bg-[#0d1117] text-gray-400 flex items-center justify-center">
        Election not found
      </div>
    );
  }

  /* ---------------- Time logic ---------------- */
  const now = Date.now();
  const start = new Date(election.startdate).getTime();
  const end = new Date(election.enddate).getTime();

  if (now < start) {
    return <UpcomingElectionDetail election={election} />;
  }

  if (now >= start && now <= end) {
    return <OngoingElectionDetail election={election} />;
  }

  return <CompletedElectionDetail election={election} />;
};

export default ElectionDetailPage;
