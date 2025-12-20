import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  walletAddress: { type: String, unique: true },
  AdhaarNumber: { type: String, unique: true },
  DOB: Date,
  VoterID: { type: String, unique: true, sparse: true },
  role: {
    type: String,
    enum: ["user","SUPER_ADMIN", "ELECTION_MANAGER", "ELECTION_AUTHORITY", "VOTER"],
    required: true,
    default: "user"
  }


});

export default mongoose.model("User", userSchema);