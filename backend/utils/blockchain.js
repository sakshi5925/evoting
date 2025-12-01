import { ethers } from "ethers";
import dotenv from "dotenv";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

//Load environment variables from .env
dotenv.config();

//Properly define __dirname and __filename for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

//Load environment variables
const RPC_URL = process.env.SEPOLIA_URL;


// //Setup provider and wallet (signer)
const provider = new ethers.JsonRpcProvider(RPC_URL);
// const wallet = new ethers.Wallet(PRIVATE_KEY, provider);


//Correct relative paths to ABI files

const rolesAbiPath = resolve(__dirname, "../../blockchain/artifacts/contracts/Roles.sol/Roles.json");
const electionFactoryAbiPath = resolve(__dirname, "../../blockchain/artifacts/contracts/ElectonFactory.sol/ElectionFactory.json");
const electionAbiPath = resolve(__dirname, "../../blockchain/artifacts/contracts/Election.sol/Election.json");


//Read and parse ABI JSON file
const rolesAbi = JSON.parse(readFileSync(rolesAbiPath)).abi;
const electionFactoryAbi = JSON.parse(readFileSync(electionFactoryAbiPath)).abi;
const electionAbi = JSON.parse(readFileSync(electionAbiPath)).abi;

//Load deployed contract addresses from .env
const RolesAddress = process.env.ROLES_CONTRACT;
const ElectionFactoryAddress = process.env.ELECTION_FACTORY_CONTRACT;

// //Create contract instances (connected to signer)
// const RolesContract = new ethers.Contract(RolesAddress, rolesAbi, wallet);
// const ElectionFactoryContract = new ethers.Contract(ElectionFactoryAddress, electionFactoryAbi, wallet);

//Log to confirm successful setup

const RolesContract = (privateKey) => {
    const wallet = new ethers.Wallet(privateKey, provider);
    return new ethers.Contract(RolesAddress, rolesAbi, wallet);
}
const ElectionFactoryContract = (privateKey) => {
    const wallet = new ethers.Wallet(privateKey, provider);
    return new ethers.Contract(ElectionFactoryAddress, electionFactoryAbi, wallet);
}

//Export for use in controllers or routes
export { rolesAbi, electionFactoryAbi, electionAbi, RolesAddress, ElectionFactoryAddress, provider, RolesContract, ElectionFactoryContract };


