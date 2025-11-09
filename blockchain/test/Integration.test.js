const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("🗳️ Integrated Roles + Election System", function () {
  let Roles, Election;
  let roles, election;
  let superAdmin, electionManager, electionAuthority, voter1, voter2, voter3, candidate1, candidate2;

beforeEach(async function () {
  [superAdmin, electionManager, electionAuthority, voter1, voter2, voter3, candidate1, candidate2] =
    await ethers.getSigners();

  // Deploy Roles contract
  Roles = await ethers.getContractFactory("Roles");
  roles = await Roles.connect(superAdmin).deploy(superAdmin.address);
  await roles.waitForDeployment();

  // Grant election manager
  await roles.connect(superAdmin).addElectionManager(electionManager.address);

  // Deploy Election contract
  const currentTime = (await ethers.provider.getBlock("latest")).timestamp;
  const startTime = currentTime + 60;
  const endTime = startTime + 300;
  const registrationDeadline = startTime - 30;

  Election = await ethers.getContractFactory("Election");
  election = await Election.connect(electionManager).deploy(
    await roles.getAddress(),
    electionManager.address,
    "College Election 2025",
    "Student Council Voting",
    startTime,
    endTime,
    registrationDeadline
  );
  await election.waitForDeployment();
});



  it("✅ should deploy contracts and set correct initial roles", async function () {
    expect(await roles.isSuperAdmin(superAdmin.address)).to.be.true;
    expect(await roles.isElectionManager(electionManager.address)).to.be.true;
    const info = await election.getElectionInfo();
    expect(info.name).to.equal("College Election 2025");
  });

  it("✅ should allow manager to start registration and authority to approve candidates", async function () {
    // Start Registration
    await election.connect(electionManager).startCandidateRegistration();
    let info = await election.getElectionInfo();
    expect(info.status).to.equal(1); // Registration

    // Add Election Authority
    await roles.connect(electionManager).addElectionAuthority(electionAuthority.address);

    // Candidates register
    await election.connect(candidate1).registerCandidate("Alice", "TechParty", "Innovation!", "ipfs://alice");
    await election.connect(candidate2).registerCandidate("Bob", "EcoParty", "Sustainability!", "ipfs://bob");

    let pending = await election.getPendingCandidates();
    expect(pending.length).to.equal(2);

    // Approve both candidates
    await election.connect(electionAuthority).validateCandidate(1, true);
    await election.connect(electionAuthority).validateCandidate(2, true);

    info = await election.getElectionInfo();
    expect(info.totalCandidates).to.equal(2);
  });

  it("✅ full election lifecycle: registration → voting → result", async function () {
    // Add roles
    await roles.connect(electionManager).addElectionAuthority(electionAuthority.address);
    await roles.connect(electionAuthority).addVoter(voter1.address);
    await roles.connect(electionAuthority).addVoter(voter2.address);
    await roles.connect(electionAuthority).addVoter(voter3.address);

    // Start registration
    await election.connect(electionManager).startCandidateRegistration();
    await election.connect(candidate1).registerCandidate("Alice", "TechParty", "Innovation!", "ipfs://alice");
    await election.connect(candidate2).registerCandidate("Bob", "EcoParty", "Sustainability!", "ipfs://bob");

    // Approve both
    await election.connect(electionAuthority).validateCandidate(1, true);
    await election.connect(electionAuthority).validateCandidate(2, true);

    // Fast forward to voting start
    await ethers.provider.send("evm_increaseTime", [70]);
    await ethers.provider.send("evm_mine");

    // Start Voting
    await election.connect(electionManager).startVoting();
    let info = await election.getElectionInfo();
    expect(info.status).to.equal(2); // Voting

    // Voters cast votes
    await election.connect(voter1).castVote(1);
    await election.connect(voter2).castVote(2);
    await election.connect(voter3).castVote(1);

    info = await election.getElectionInfo();
    expect(info.totalVotes).to.equal(3);

    const c1 = await election.getCandidateDetails(1);
    const c2 = await election.getCandidateDetails(2);
    expect(c1.voteCount).to.equal(2);
    expect(c2.voteCount).to.equal(1);

    // End Election
    await ethers.provider.send("evm_increaseTime", [400]);
    await ethers.provider.send("evm_mine");
    await election.connect(electionManager).endElection();

    // Declare Result
    await election.connect(electionManager).declareResult();

    info = await election.getElectionInfo();
    expect(info.status).to.equal(4); // ResultDeclared

    const winnerId = await election.getWinner();
    expect(winnerId).to.equal(1); // Alice wins 🎉
  });
});
