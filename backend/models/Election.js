import mongoose from "mongoose";

const electionSchema = new mongoose.Schema({
  ElectionName: String,
  description: String,
  managerAddress: String,
  contractAddress: {type: String, unique: true},
  status: {
    type: String,
    enum: ["Created", "Registration", "Voting", "Ended", "ResultDeclared"],
    default: "Created",
  },
  startTime: Number, 
  endTime: Number,
  registrationDeadline: Number,
  startdate: Date,
  enddate: Date,
  totalVotes: { type: Number, default: 0 },
  totalCandidates: { type: Number, default: 0 },
  candidates: [{ type: mongoose.Schema.Types.ObjectId, ref: "Candidate" }],
  isActive: { type: Boolean, default: true },
  
});

export default mongoose.model("Election", electionSchema);
