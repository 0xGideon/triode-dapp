const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TriodeMarket", function () {
  let triode;
  let owner;
  let user;

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();
    const TriodeMarket = await ethers.getContractFactory("TriodeMarket");
    triode = await TriodeMarket.deploy();
    await triode.waitForDeployment();
  });

  it("test runner works", function () {
    expect(true).to.equal(true);
  });

  it("a deposit under the cap succeeds and userStake reflects the net amount", async function () {
    const gross = ethers.parseEther("1"); // 1 ETH gross
    await triode.connect(user).deposit(0, { value: gross }); // Option.A == 0

    // 10% fee means the net stake is 90% of what was sent.
    const expectedNet = (gross * 9000n) / 10000n;
    expect(await triode.userStake(1, user.address, 0)).to.equal(expectedNet);
  });

  it("a deposit of 0 ETH reverts with ZeroDeposit", async function () {
    await expect(triode.connect(user).deposit(0, { value: 0 })).to.be.revertedWithCustomError(
      triode,
      "ZeroDeposit"
    );
  });

  it("a deposit over the 10 ETH net cap on one option reverts with ExceedsMaxStake", async function () {
    // First deposit 10 ETH gross -> 9 ETH net (under the 10 ETH cap).
    await triode.connect(user).deposit(0, { value: ethers.parseEther("10") });

    // A second 2 ETH deposit would add 1.8 ETH net, pushing the wallet to 10.8 ETH net -> over cap.
    await expect(
      triode.connect(user).deposit(0, { value: ethers.parseEther("2") })
    ).to.be.revertedWithCustomError(triode, "ExceedsMaxStake");
  });
});
