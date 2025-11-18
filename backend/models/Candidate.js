import mongoose from "mongoose";

const candidateSchema = new mongoose.Schema({
  election: { type: mongoose.Schema.Types.ObjectId, ref: "Election" },
  candidateId: { type: Number, required: true ,unique:true},
  candidateAddress: String,
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

});

export default mongoose.model("Candidate", candidateSchema);
