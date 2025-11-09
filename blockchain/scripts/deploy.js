const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("==============================================");
  console.log(`🚀 Deploying contracts using: ${deployer.address}`);
  console.log(
    `💰 Balance: ${hre.ethers.formatEther(
      await hre.ethers.provider.getBalance(deployer.address)
    )} ETH\n`
  );

  // ✅ 1. Deploy Roles contract
  console.log("🔹 Deploying Roles contract...");
  const Roles = await hre.ethers.getContractFactory("Roles");
  const roles = await Roles.deploy(deployer.address); // deployer = super admin
  await roles.waitForDeployment();
  const rolesAddress = await roles.getAddress();
  console.log(`✅ Roles deployed at: ${rolesAddress}\n`);

  // ✅ 2. Deploy ElectionFactory contract
  console.log("🔹 Deploying ElectionFactory contract...");
  const ElectionFactory = await hre.ethers.getContractFactory("ElectionFactory");
  const electionFactory = await ElectionFactory.deploy(rolesAddress);
  await electionFactory.waitForDeployment();
  const factoryAddress = await electionFactory.getAddress();
  console.log(`✅ ElectionFactory deployed at: ${factoryAddress}\n`);

  // ✅ 3. Grant ElectionManager role to deployer
  console.log("🔹 Granting ElectionManager role to deployer...");
  const tx = await roles.addElectionManager(deployer.address);
  await tx.wait();
  console.log(`✅ ElectionManager role granted to: ${deployer.address}\n`);

  // ✅ 4. Save deployment info
  const data = {
    network: hre.network.name,
    deployer: deployer.address,
    Roles: rolesAddress,
    ElectionFactory: factoryAddress,
    timestamp: new Date().toISOString(),
  };

  fs.writeFileSync("deployment.json", JSON.stringify(data, null, 2));
  console.log("📄 Deployment details saved to deployment.json");
  console.log("==============================================");
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exit(1);
});
