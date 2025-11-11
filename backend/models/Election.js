import mongoose from "mongoose";

const electionSchema = new mongoose.Schema({
  name: String,
  description: String,
  managerAddress: String, // from blockchain
  contractAddress: String, // deployed Election contract address
  status: {
    type: String,
    enum: ["Created", "Registration", "Voting", "Ended", "ResultDeclared"],
    default: "Created",
  },
  startTime: Number, // UNIX timestamp
  endTime: Number,
  registrationDeadline: Number,
  totalVotes: { type: Number, default: 0 },
  candidates: [{ type: mongoose.Schema.Types.ObjectId, ref: "Candidate" }],
  blockchainTxHash: String, // optional - creation transaction hash
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Election", electionSchema);
