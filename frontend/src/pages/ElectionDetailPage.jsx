import React from "react";
import { useParams } from "react-router-dom";

import sampleElections from "../data/sampleElections";
import UpcomingElectionDetail from "../components/election/details/UpcomingElectionDetail";
import OngoingElectionDetail from "../components/election/details/OngoingElectionDetail";
import CompletedElectionDetail from "../components/election/details/CompletedElectionDetail";

const ElectionDetailPage = () => {
  const { id } = useParams();
  const election = sampleElections.find((e) => e._id === id);

  if (!election) return <div className="text-white p-6">Election not found</div>;

  const now = new Date();
  const start = new Date(election.ElectionStartTime);
  const end = new Date(election.ElectionEndTime);

  if (start > now) {
    return (
      <UpcomingElectionDetail
        election={election}
        userStatus={{ eligible: true, isVoter: false, isCandidate: false }}
      />
    );
  }

  if (start <= now && end >= now) {
    return <OngoingElectionDetail election={election} />;
  }

  return <CompletedElectionDetail election={election} />;
};

export default ElectionDetailPage;
