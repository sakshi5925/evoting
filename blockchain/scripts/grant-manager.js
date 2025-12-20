const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  const ROLES_ADDRESS = "0x87957B476d6219cf376D4518B4EE7F481Ad610cC";

  console.log("Granting ELECTION_MANAGER role...");
  console.log("Deployer:", deployer.address);

  const Roles = await hre.ethers.getContractFactory("Roles");
  const roles = Roles.attach(ROLES_ADDRESS);

  const tx = await roles.addElectionManager(deployer.address);
  console.log("Tx sent:", tx.hash);

  await tx.wait();
  console.log("✅ ELECTION_MANAGER role granted");
}

main().catch(console.error);