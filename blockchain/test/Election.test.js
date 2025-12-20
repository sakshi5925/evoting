const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("Election", function () {
  let roles, election;
  let admin, manager, authority, voter1, voter2, candidate;

  const DAY = 24 * 60 * 60;

  beforeEach(async function () {
    [admin, manager, authority, voter1, voter2, candidate] =
      await ethers.getSigners();

    const Roles = await ethers.getContractFactory("Roles");
    roles = await Roles.deploy(admin.address);
    await roles.waitForDeployment();

    await roles.connect(admin).addElectionManager(manager.address);
    await roles.connect(manager).addElectionAuthority(authority.address);
    await roles.connect(authority).addVoter(voter1.address);
    await roles.connect(authority).addVoter(voter2.address);

    const now = await time.latest();

    const Election = await ethers.getContractFactory("Election");
    election = await Election.deploy(
      await roles.getAddress(),
      manager.address,
      "Test Election",
      "Description",
      now + 3 * DAY,
      now + 5 * DAY,
      now + 2 * DAY
    );
    await election.waitForDeployment();
  });

  it("manager starts registration", async function () {
    await election.connect(manager).startCandidateRegistration();
    const info = await election.electionInfo();
    expect(info.status).to.equal(1); // Registration
  });

  it("candidate registers and gets approved", async function () {
    await election.connect(manager).startCandidateRegistration();
    await election.connect(candidate).registerCandidate("Alice", "PartyA");
    await election.connect(authority).validateCandidate(1, true);

    const info = await election.electionInfo();
    expect(info.totalCandidates).to.equal(1);
  });

  it("voter can vote", async function () {
    await election.connect(manager).startCandidateRegistration();
    await election.connect(candidate).registerCandidate("Alice", "PartyA");
    await election.connect(authority).validateCandidate(1, true);

    await time.increaseTo((await election.electionInfo()).startTime);
    await election.connect(manager).startVoting();

    await election.connect(voter1).castVote(1);
    expect(await election.hasVoted(voter1.address)).to.equal(true);
  });
});
