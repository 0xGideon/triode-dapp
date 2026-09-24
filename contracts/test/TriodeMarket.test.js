const { expect } = require("chai");
const { ethers, network } = require("hardhat");

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

  async function fastForward(seconds) {
    await network.provider.send("evm_increaseTime", [seconds]);
    await network.provider.send("evm_mine");
  }

  // NOTE: isWinningOption is a mapping INSIDE the Round struct, so Solidity does NOT auto-generate
  // a getter for it (the rounds(roundId) getter only returns non-mapping members). To verify the
  // winner determination, we read the RoundResolved event's aWon/bWon/cWon args — resolveRound sets
  // those from the exact same booleans it writes into isWinningOption — plus the struct getter's
  // winner / winningPoolTotal / totalVolume fields.
  async function getRoundResolvedArgs(tx) {
    const receipt = await tx.wait();
    for (const log of receipt.logs) {
      try {
        const parsed = triode.interface.parseLog(log);
        if (parsed && parsed.name === "RoundResolved") return parsed.args;
      } catch (e) {
        // Ignore logs we can't parse (they're from other events/contracts).
      }
    }
    return null;
  }

  it("single winner: least-deposited option wins, winningPoolTotal matches it, winner set", async function () {
    // A is lowest (1 ETH), B and C are higher.
    await triode.connect(user).deposit(0, { value: ethers.parseEther("1") }); // A
    await triode.connect(user).deposit(1, { value: ethers.parseEther("2") }); // B
    await triode.connect(user).deposit(2, { value: ethers.parseEther("3") }); // C

    await fastForward(4 * 24 * 60 * 60); // 4 days > 3.5 day duration
    const tx = await triode.resolveRound(1);
    const args = await getRoundResolvedArgs(tx);

    // A won, B and C lost.
    expect(args.aWon).to.equal(true);
    expect(args.bWon).to.equal(false);
    expect(args.cWon).to.equal(false);
    expect(args.winningPoolTotal).to.equal(ethers.parseEther("0.9"));

    // The struct getter exposes winner and winningPoolTotal (both non-mapping fields).
    const r = await triode.rounds(1);
    expect(r.winner).to.equal(0); // Option.A == 0
    expect(r.winningPoolTotal).to.equal(ethers.parseEther("0.9")); // A's net total (1 * 0.9)
    expect(r.resolved).to.equal(true);
  });

  it("two-way tie: both least-deposited options win and winningPoolTotal is their sum", async function () {
    // A and B are equal and lowest, C is higher.
    await triode.connect(user).deposit(0, { value: ethers.parseEther("1") }); // A
    await triode.connect(user).deposit(1, { value: ethers.parseEther("1") }); // B
    await triode.connect(user).deposit(2, { value: ethers.parseEther("3") }); // C

    await fastForward(4 * 24 * 60 * 60);
    const tx = await triode.resolveRound(1);
    const args = await getRoundResolvedArgs(tx);

    expect(args.aWon).to.equal(true);
    expect(args.bWon).to.equal(true);
    expect(args.cWon).to.equal(false);
    expect(args.winningPoolTotal).to.equal(ethers.parseEther("1.8")); // 0.9 + 0.9

    const r = await triode.rounds(1);
    expect(r.winningPoolTotal).to.equal(ethers.parseEther("1.8"));
  });

  it("three-way tie: all three win and winningPoolTotal equals totalVolume", async function () {
    await triode.connect(user).deposit(0, { value: ethers.parseEther("1") }); // A
    await triode.connect(user).deposit(1, { value: ethers.parseEther("1") }); // B
    await triode.connect(user).deposit(2, { value: ethers.parseEther("1") }); // C

    await fastForward(4 * 24 * 60 * 60);
    const tx = await triode.resolveRound(1);
    const args = await getRoundResolvedArgs(tx);

    expect(args.aWon).to.equal(true);
    expect(args.bWon).to.equal(true);
    expect(args.cWon).to.equal(true);

    const r = await triode.rounds(1);
    expect(r.winningPoolTotal).to.equal(r.totalVolume);
  });

  it("resolving an already-resolved round reverts with RoundAlreadyResolved", async function () {
    await triode.connect(user).deposit(0, { value: ethers.parseEther("1") });
    await fastForward(4 * 24 * 60 * 60);
    await triode.resolveRound(1);

    await expect(triode.resolveRound(1)).to.be.revertedWithCustomError(
      triode,
      "RoundAlreadyResolved"
    );
  });

  it("resolving a not-yet-closed round reverts with RoundNotYetClosed", async function () {
    await triode.connect(user).deposit(0, { value: ethers.parseEther("1") });

    // Time has NOT elapsed and volume has NOT hit the cap -> still open.
    await expect(triode.resolveRound(1)).to.be.revertedWithCustomError(
      triode,
      "RoundNotYetClosed"
    );
  });
});
