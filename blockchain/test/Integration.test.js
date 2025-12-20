const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Integration Flow", function () {
  it("admin → manager → voters", async function () {
    const [admin, manager, authority, voter, candidate] =
      await ethers.getSigners();

    const Roles = await ethers.getContractFactory("Roles");
    const roles = await Roles.deploy(admin.address);
    await roles.waitForDeployment();

    await roles.connect(admin).addElectionManager(manager.address);
    await roles.connect(manager).addElectionAuthority(authority.address);
    await roles.connect(authority).addVoter(voter.address);

    const now = (await ethers.provider.getBlock("latest")).timestamp;

    const Election = await ethers.getContractFactory("Election");
    const election = await Election.deploy(
      await roles.getAddress(),
      manager.address,
      "Final Election",
      "Desc",
      now + 30,
      now + 120,
      now + 20
    );
    await election.waitForDeployment();

    await election.connect(manager).startCandidateRegistration();
    await election.connect(candidate).registerCandidate("Alice", "Party");
    await election.connect(authority).validateCandidate(1, true);

    await ethers.provider.send("evm_increaseTime", [40]);
    await election.connect(manager).startVoting();

    await election.connect(voter).castVote(1);
    expect(await election.hasVoted(voter.address)).to.equal(true);
  });
});
