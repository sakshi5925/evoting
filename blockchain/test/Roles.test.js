const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Roles", function () {
  let roles;
  let superAdmin, manager, authority, voter, other;

  beforeEach(async function () {
    [superAdmin, manager, authority, voter, other] = await ethers.getSigners();

    const Roles = await ethers.getContractFactory("Roles");
    roles = await Roles.deploy(superAdmin.address);
    await roles.waitForDeployment();
  });

  it("sets super admin on deploy", async function () {
    expect(await roles.isSuperAdmin(superAdmin.address)).to.equal(true);
  });

  it("super admin can add election manager", async function () {
    await roles.connect(superAdmin).addElectionManager(manager.address);
    expect(await roles.isElectionManager(manager.address)).to.equal(true);
  });

  it("manager can add election authority", async function () {
    await roles.connect(superAdmin).addElectionManager(manager.address);
    await roles.connect(manager).addElectionAuthority(authority.address);

    expect(await roles.isElectionAuthority(authority.address)).to.equal(true);
  });

  it("authority can add voter", async function () {
    await roles.connect(superAdmin).addElectionManager(manager.address);
    await roles.connect(manager).addElectionAuthority(authority.address);
    await roles.connect(authority).addVoter(voter.address);

    expect(await roles.isVoter(voter.address)).to.equal(true);
  });

  it("non-super-admin cannot add manager", async function () {
    await expect(
      roles.connect(other).addElectionManager(other.address)
    ).to.be.revertedWith("Restricted to SUPER_ADMIN");
  });
});
