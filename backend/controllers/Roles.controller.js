import { ethers } from "ethers";
import { rolesAbi, RolesAddress, provider } from "../utils/blockchain.js";


export  const addUser=async function(res,req){
        try{

        const { PRIVATE_KEY, userAddress, role } = req.body;

        if (!PRIVATE_KEY) {
            return res.status(400).json({ message: "Private key is required" });
        
        }

        console.log("User private key:", PRIVATE_KEY);
        console.log("User address:", userAddress);
        console.log("Role:", role);

        const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

        const RolesContract = new ethers.Contract(RolesAddress, rolesAbi, wallet);

        let tx;

        switch (role) {
         case "admin":
        tx = await RolesContract.addSuperAdmin(userAddress);
        break;
         case "electionManager":
        tx = await RolesContract.addElectionManager(userAddress);
        break;
         case "electionAuthority":
        tx = await RolesContract.addElectionAuthority(userAddress);
        break;
         case "voter":
        tx = await RolesContract.addVoter(userAddress);
        break;
         default:
        return res.status(400).json({ message: "Invalid role" });
    }
        await tx.wait();
        console.log(`${role} role assigned to ${userAddress}`);
        return res.status(200).json({ message: `${role} assigned to ${userAddress}` });
    
    }
    
        catch (error) {
        console.error("Error assigning role:", error);
        return res.status(500).json({ error: error.message });
    }

}

export const removeUser=async function(res,req){
    
    try{
        const { PRIVATE_KEY, userAddress, role } = req.body;

        if (!PRIVATE_KEY) {
            return res.status(400).json({ message: "Private key is required" });
        }

        const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
        
        const RolesContract = new ethers.Contract(RolesAddress, rolesAbi, wallet);

        let tx;

        switch (role) {
         case "admin":
        tx = await RolesContract.removeSuperAdmin(userAddress);
        break;
         case "electionManager":
        tx = await RolesContract.removeElectionManager(userAddress);
        break;
         case "electionAuthority":
        tx = await RolesContract.removeElectionAuthority(userAddress);
        break;
         case "voter":
        tx = await RolesContract.removeVoter(userAddress);
        break;
         default:
        return res.status(400).json({ message: "Invalid role" });
    }

    }

    catch (error) {
        console.error("Error removing role:", error);
        return res.status(500).json({ error: error.message });
    }

}

export const checkRoles=async function(res,req){

    try{
        const { userAddress } = req.body;

        const RolesContract = new ethers.Contract(RolesAddress, rolesAbi, provider);
        
        const isAdmin = await RolesContract.isSuperAdmin(userAddress);
        const isElectionManager = await RolesContract.isElectionManager(userAddress);
        const isElectionAuthority = await RolesContract.isElectionAuthority(userAddress);
        const isVoter = await RolesContract.isVoter(userAddress);

        return res.status(200).json({
            isAdmin: isAdmin,
            isElectionManager: isElectionManager,
            isElectionAuthority: isElectionAuthority,
            isVoter: isVoter
        });
    }
    catch (error) {
        console.error("Error checking role:", error);
        return res.status(500).json({ error: error.message });
    }
}