import { ethers } from "ethers";
import { rolesAbi, RolesAddress, provider, RolesContract } from "../utils/blockchain.js";
import User  from "../models/User.js";


export const AssignRole = async function (req, res) {
    try {

        const {walletAddress, role } = req.body;
        const privateKey =process.env.PRIVATE_KEY;
        if (!privateKey) {
            return res.status(400).json({ message: "Private key is required" });
        }

        // console.log("User private key:", privateKey);
        // console.log("User address:", walletAddress);
        // console.log("Role:", role);

        const RoleContract = RolesContract(privateKey);

        let tx;

        switch (role) {
            case "SUPER_ADMIN":
                tx = await RoleContract.addSuperAdmin(walletAddress);
                break;
            case "ELECTION_MANAGER":
                tx = await RoleContract.addElectionManager(walletAddress);
                break;
            case "ELECTION_AUTHORITY":
                tx = await RoleContract.addElectionAuthority(walletAddress);
                break;
            case "VOTER":
                tx = await RoleContract.addVoter(walletAddress);
                break;
            default:
                return res.status(400).json({ message: "Invalid role" });


        }
        await tx.wait();
        console.log(tx);

        const user = await User.findOne({ walletAddress });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.role = role;
        await user.save();
        console.log(`${role} role assigned to ${user.role}`);

        return res.status(200).json({ message: `${role} assigned to ${walletAddress}` });

    }

    catch (error) {
        console.error("Error assigning role:", error);
        return res.status(500).json({ error: error.message });
    }

}

export const removeRole = async function (req, res) {

    try {
        const { privateKey, walletAddress, role } = req.body;

        if (!privateKey) {
            return res.status(400).json({ message: "Private key is required" });
        }

        const RoleContract = RolesContract(privateKey);

        let tx;

        switch (role) {
            case "SUPER_ADMIN":
                tx = await RoleContract.removeSuperAdmin(walletAddress);
                break;
            case "ELECTION_MANAGER":
                tx = await RoleContract.removeElectionManager(walletAddress);
                break;
            case "ELECTION_AUTHORITY":
                tx = await RoleContract.removeElectionAuthority(walletAddress);
                break;
            case "VOTER":
                tx = await RoleContract.removeVoter(walletAddress);
                break;
        }

        await tx.wait();

        console.log(`${role} role removed from ${walletAddress}`);

        const user = await User.findOne({ walletAddress });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.role = "user";
        await user.save();

        return res.status(200).json({ message: `${role} removed from ${walletAddress}` });

    }

    catch (error) {
        console.error("Error removing role:", error);
        return res.status(500).json({ error: error.message });
    }

}

export const checkRoles = async (req, res) => {
  try {
    const { walletAddress } = req.body;

    console.log("Checking roles (DB) for wallet:", walletAddress);

    if (!walletAddress || typeof walletAddress !== "string") {
      return res.status(400).json({ message: "Invalid wallet address" });
    }

    const user = await User.findOne({ walletAddress });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      role: user.role || "user",
      isAdmin: user.role === "SUPER_ADMIN",
      isElectionManager: user.role === "ELECTION_MANAGER",
      isElectionAuthority: user.role === "ELECTION_AUTHORITY",
      isVoter: user.role === "VOTER",
    });

  } catch (error) {
    console.error("Error checking role from DB:", error);
    return res.status(500).json({ error: error.message });
  }
};

export const ElectionManagersList = async function (req, res) {
    try{
        const electionManagers = await User.find({ role: "ELECTION_MANAGER" });
        // console.log("Election Managers List:", electionManagers);
        return res.status(200).json(electionManagers);
    }
    catch (error) {
        // console.error("Error fetching election managers:", error);
        return res.status(500).json({ error: error.message });
    }
}

export const getAllUsers = async function (req, res) {
    try {
        const users = await User.find({});
        
        return res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        return res.status(500).json({ error: error.message });
    }
}