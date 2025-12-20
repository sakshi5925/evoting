const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("ElectionFactory", function () {
  let roles, factory;
  let admin, manager;

  beforeEach(async function () {
    [admin, manager] = await ethers.getSigners();

    const Roles = await ethers.getContractFactory("Roles");
    roles = await Roles.deploy(admin.address);
    await roles.waitForDeployment();

    await roles.connect(admin).addElectionManager(manager.address);

    const Factory = await ethers.getContractFactory("ElectionFactory");
    factory = await Factory.deploy(await roles.getAddress());
    await factory.waitForDeployment();
  });

  it("admin creates election and assigns manager", async function () {
    const now = await time.latest();

    const tx = await factory.connect(admin).createElection(
      manager.address,
      "College Election",
      "Desc",
      now + 100,
      now + 500,
      now + 50
    );

    const receipt = await tx.wait();
    const event = receipt.logs
      .map(log => {
        try { return factory.interface.parseLog(log); } catch { return null; }
      })
      .find(e => e?.name === "ElectionCreated");

    expect(event.args.creator).to.equal(admin.address);
    expect(event.args.manager).to.equal(manager.address);
  });
});
