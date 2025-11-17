import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  walletAddress: { type: String, unique: true },
  AdhaarNumber: { type: String, unique: true },
  DOB: Date,
  role: {
    type: String,
    enum: ["admin", "electionManager", "electionAuthority", "voter"],
    required: true,
    default: "user"
  }


});

export default mongoose.model("User", userSchema);