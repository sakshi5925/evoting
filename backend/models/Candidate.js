import mongoose from "mongoose";

const candidateSchema = new mongoose.Schema({
  election: { type: mongoose.Schema.Types.ObjectId, ref: "Election" },
  blockchainId: Number, // ID assigned on-chain
  walletAddress: String,
  name: String,
  party: String,
  manifesto: String,
  imageHash: String, // IPFS/Arweave hash
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending"
  },
  voteCount: { type: Number, default: 0 },
  localVotes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Vote" }],
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model("Candidate", candidateSchema);
