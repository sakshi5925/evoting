import { Router } from "express";

import { createElection,deactivateElection,reactivateElection,startCandidateRegistration,startVoting,endElection, declareResults,changeStatus,registerCandidate,validateCandidate,castVote,getWinner,getCandidateDetails,getPendingCandidates,isVoterRole,getTotalCandidates,getUpcomingElections,getOngoingElections,getCompletedElections,getAllElections } from "../controllers/Election.controller.js";

const electionRouter = Router();

electionRouter.post("/create", createElection);
electionRouter.post("/deactivate", deactivateElection);
electionRouter.post("/reactivate", reactivateElection);
electionRouter.post("/startCandidateRegistration", startCandidateRegistration);
electionRouter.post("/startVoting", startVoting);
electionRouter.post("/endElection", endElection);
electionRouter.post("/declareResults", declareResults);
electionRouter.post("/changeStatus", changeStatus);
electionRouter.post("/registerCandidate", registerCandidate);
electionRouter.post("/validateCandidate", validateCandidate);
electionRouter.post("/castVote", castVote);
electionRouter.post("/getWinner", getWinner);
electionRouter.post("/getCandidateDetails", getCandidateDetails);
electionRouter.post("/getPendingCandidates", getPendingCandidates);
// electionRouter.post("/getVoterStatus", getVoterStatus);
// electionRouter.post("/getElectionInfo", getElectionInfo);
electionRouter.post("/isVoterRole", isVoterRole);
electionRouter.post("/getTotalCandidates", getTotalCandidates);
electionRouter.get("/getUpcomingElections", getUpcomingElections);
electionRouter.get("/getOngoingElections", getOngoingElections);
electionRouter.get("/getCompletedElections", getCompletedElections);
electionRouter.get("/getAllElections", getAllElections);

export default electionRouter;
