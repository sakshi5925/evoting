import mongoose from "mongoose";

const candidateSchema = new mongoose.Schema({
  electionAddress: {
    type: String,
    required: true,
    index: true,
  },
  candidateId: {
    type: Number,
    required: true,
    
  },
  candidateAddress: {
    type: String,
    required: true,
    index: true,
  },
  name: String,
  party: String,
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending",
  },
  voteCount: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

candidateSchema.index(
  { electionAddress: 1, candidateId: 1 },
  { unique: true }
);

candidateSchema.index(
  { electionAddress: 1, candidateAddress: 1 },
  { unique: true }
);


export default mongoose.model("Candidate", candidateSchema);
