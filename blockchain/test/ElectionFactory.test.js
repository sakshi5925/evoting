const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("ElectionFactory Contract", function () {
  let roles, factory;
  let superAdmin, manager, authority, voter1, voter2;
  let startTime, endTime, registrationDeadline;
  const DAY = 24 * 60 * 60;

  beforeEach(async function () {
    [superAdmin, manager, authority, voter1, voter2] = await ethers.getSigners();

    const Roles = await ethers.getContractFactory("Roles");
    roles = await Roles.deploy(superAdmin.address);
    await roles.waitForDeployment();

    await roles.connect(superAdmin).addElectionManager(manager.address);

    const ElectionFactory = await ethers.getContractFactory("ElectionFactory");
    factory = await ElectionFactory.deploy(await roles.getAddress());
    await factory.waitForDeployment();

    const now = await time.latest();
    registrationDeadline = now + 7 * DAY;
    startTime = now + 10 * DAY;
    endTime = now + 17 * DAY;
  });

  describe("Deployment", function () {
    it("Should deploy ElectionFactory successfully", async function () {
      expect(await factory.roles()).to.equal(await roles.getAddress());
      expect(await factory.getTotalElections()).to.equal(0);
    });
  });

  describe("Create Election", function () {
  it("Should allow election manager to create a new election", async function () {
    const tx = await factory.connect(manager).createElection(
    "College Election",
    "Election for college council",
    startTime,
    endTime,
    registrationDeadline
  );

  const receipt = await tx.wait();

  // Get the event data properly
  const event = receipt.logs.find(log => {
    try {
      return factory.interface.parseLog(log).name === "ElectionCreated";
    } catch {
      return false;
    }
  });
  expect(event).to.not.be.undefined;

  const parsedEvent = factory.interface.parseLog(event);
  const electionAddress = parsedEvent.args.electionAddress; // ✅ capture emitted election address

  const total = await factory.getTotalElections();
  expect(total).to.equal(1);

  // ✅ Fetch election using address, not index
  const election = await factory.getElection(electionAddress);
  expect(election.name).to.equal("College Election");
  expect(election.creator).to.equal(manager.address);
  expect(election.isActive).to.be.true;
});

    it("Should emit ElectionCreated event with correct parameters", async function () {
      await expect(
        factory.connect(manager).createElection(
          "Test Election",
          "Description",
          startTime,
          endTime,
          registrationDeadline
        )
      ).to.emit(factory, "ElectionCreated");
    });

    it("Should not allow non-election manager to create election", async function () {
      await expect(
        factory.connect(voter1).createElection(
          "Invalid Election",
          "Unauthorized",
          startTime,
          endTime,
          registrationDeadline
        )
      ).to.be.revertedWith("Only election manager");
    });
  });
});
