const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("==============================================");
  console.log(`🚀 Deploying contracts using: ${deployer.address}`);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(`💰 Balance: ${hre.ethers.formatEther(balance)} ETH\n`);

  /* ------------------------------------------------
     1️⃣ Deploy Roles (deployer = SUPER_ADMIN)
  ------------------------------------------------ */
  console.log("🔹 Deploying Roles contract...");
  const Roles = await hre.ethers.getContractFactory("Roles");
  const roles = await Roles.deploy(deployer.address);
  await roles.waitForDeployment();

  const rolesAddress = await roles.getAddress();
  console.log(`✅ Roles deployed at: ${rolesAddress}\n`);

  /* ------------------------------------------------
     2️⃣ Deploy ElectionFactory
  ------------------------------------------------ */
  console.log("🔹 Deploying ElectionFactory contract...");
  const ElectionFactory = await hre.ethers.getContractFactory("ElectionFactory");
  const electionFactory = await ElectionFactory.deploy(rolesAddress);
  await electionFactory.waitForDeployment();

  const factoryAddress = await electionFactory.getAddress();
  console.log(`✅ ElectionFactory deployed at: ${factoryAddress}\n`);

  /* ------------------------------------------------
     3️⃣ Grant ELECTION_MANAGER role
     (Admin assigns manager explicitly)
  ------------------------------------------------ */
  console.log("🔹 Granting ELECTION_MANAGER role to deployer...");
  const tx = await roles
    .connect(deployer)
    .addElectionManager(deployer.address);
  await tx.wait();

  console.log(`✅ ELECTION_MANAGER granted to: ${deployer.address}\n`);

  /* ------------------------------------------------
     4️⃣ Save deployment info
  ------------------------------------------------ */
  const deploymentData = {
    network: hre.network.name,
    deployer: deployer.address,
    contracts: {
      Roles: rolesAddress,
      ElectionFactory: factoryAddress,
    },
    timestamp: new Date().toISOString(),
  };

  fs.writeFileSync(
    "deployment.json",
    JSON.stringify(deploymentData, null, 2)
  );

  console.log("📄 Deployment details saved to deployment.json");
  console.log("==============================================");
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exit(1);
});
