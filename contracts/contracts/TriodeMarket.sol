// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// TRIODE — transparent reflexive market protocol
// To be implemented in later steps:
// - 3 options per round (A, B, C), users deposit ETH into one or more
// - max 10 ETH per wallet per option per round
// - round ends after 3.5 days OR when total contract deposits hit 100 ETH, whichever first
// - round numbering is continuous and never resets (#1, #2, #3, ... forever)
// - winner = option with the LEAST total deposited; shares the other two options' pooled deposits pro-rata
// - tie-break: all 3 equal -> everyone gets deposit back minus fee; 2-way tie for least -> those two split the 3rd option's pool
// - 10% admin fee on all deposits
// - unwithdrawn rewards roll into the next round's winning pool after a 3.5-day withdrawal window
// - Launchpad: admin-fundable balance that auto-seeds each new round at a fixed 1:2:3 ratio (A:B:C)
//   until the balance runs out, then rounds run organically; funding UI lets admin enter EITHER a
//   target round count OR an ETH amount, kept in sync at a fixed ETH-per-round rate
// - Launchpad countdown-to-launch duration is NETWORK-DEPENDENT and set at deploy time via
//   constructor parameter: 24 hours on testnet (chain id 46630), 2 months on mainnet (chain id 4663).
//   This lets us test the full countdown-to-launch flow quickly on testnet without waiting months.

contract TriodeMarket {
    /// @notice The three options a user can deposit into each round.
    /// @dev Solidity enums are numbered from 0: Option.A == 0, Option.B == 1, Option.C == 2.
    enum Option { A, B, C }

    // Custom errors are cheaper in gas than `require` with a string message, because the
    // error message text is not stored in the contract bytecode. That's why we use them here.
    error ZeroDeposit();
    error ExceedsMaxStake(uint256 attempted, uint256 max);
    error RoundNotYetClosed(uint256 roundId);
    error RoundAlreadyResolved(uint256 roundId);

    event RoundStarted(uint256 indexed roundId, uint256 startTime, uint256 endTime);
    event Deposited(uint256 indexed roundId, address indexed user, Option option, uint256 grossAmount, uint256 netAmount, uint256 fee);
    event RoundResolved(uint256 indexed roundId, bool aWon, bool bWon, bool cWon, uint256 winningPoolTotal);

    /// @notice All the information about a single round.
    /// @dev We store rounds in a mapping (keyed by roundId) rather than an array because
    ///      this struct contains mappings, and Solidity does not allow an array of structs
    ///      that contain mappings. A mapping of structs works fine.
    struct Round {
        /// @notice The continuous round number. Starts at 1 and NEVER resets for the life of the protocol.
        uint256 roundId;
        /// @notice The timestamp when this round opened for deposits.
        uint256 startTime;
        /// @notice The scheduled close time (startTime + ROUND_DURATION). The round can also close
        ///         earlier if the total volume hits EARLY_CLOSE_VOLUME.
        uint256 endTime;
        /// @notice True once the winner has been determined. Until then, `winner` is meaningless.
        bool resolved;
        /// @notice True once deposits are stopped (either by time or by hitting the volume cap).
        bool closed;
        /// @notice The winning option, set only when the round is resolved.
        Option winner;
        /// @notice Total ETH deposited into each option, NET of the 10% admin fee.
        /// @dev Keyed by Option. These three values are what "volume" is made of.
        mapping(Option => uint256) totalDeposited;
        /// @notice The number of unique addresses that deposited into each option.
        /// @dev Keyed by Option. Used to compute the "participants" count per option.
        mapping(Option => uint256) participantCount;
        /// @notice Sum of all three `totalDeposited` values. Cached so we don't have to loop.
        uint256 totalVolume;
        /// @notice Whether each option was a winner. Normally only one option wins, but ties are
        ///         possible: if two options are tied for least-deposited, BOTH are winners; if all
        ///         three are tied, ALL THREE are winners. Keyed by Option.
        mapping(Option => bool) isWinningOption;
        /// @notice The combined totalDeposited of every winning option. Used by withdraw() (a later
        ///         step) to compute each winner's payout. See the payout formula explained below.
        uint256 winningPoolTotal;
        /// @notice The timestamp resolveRound() was called. Used later to enforce the 3.5-day
        ///         withdrawal window (WITHDRAWAL_WINDOW) before rewards roll forward.
        uint256 resolvedTime;
    }

    /// @notice All rounds, keyed by their roundId. `rounds[1]` is round #1, etc.
    mapping(uint256 => Round) public rounds;

    /// @notice How much ETH each address has deposited, per round, per option (net of fee).
    /// @dev userStake[roundId][user][option] = net ETH staked.
    mapping(uint256 => mapping(address => mapping(Option => uint256))) public userStake;

    /// @notice Whether a given address has deposited on a given option in a given round.
    /// @dev We use this so `participantCount` only increments once per unique address per option,
    ///      no matter how many times that same address tops up the same option.
    mapping(uint256 => mapping(address => mapping(Option => bool))) public hasDeposited;

    /// @notice The maximum NET ETH any single address may stake on a single option in a single round.
    /// @dev 10 ether == 10 ETH. "ether" is a Solidity unit that means 1e18 wei.
    uint256 public constant MAX_STAKE_PER_OPTION = 10 ether;

    /// @notice How long a round is open for deposits, before it closes on time.
    /// @dev 3.5 days is not valid Solidity syntax, so we write it as 3 days + 12 hours (which equals 3.5 days).
    uint256 public constant ROUND_DURATION = 3 days + 12 hours;

    /// @notice The total round volume that triggers an early close (100 ETH).
    /// @dev A round closes early if totalVolume reaches this value before ROUND_DURATION elapses.
    uint256 public constant EARLY_CLOSE_VOLUME = 100 ether;

    /// @notice The admin fee, expressed in basis points.
    /// @dev Basis points are "parts per ten thousand". 1000 bps = 10% (because 1000 / 10000 = 0.10).
    uint256 public constant ADMIN_FEE_BPS = 1000;

    /// @notice How long winners have to withdraw after a round resolves, before rewards roll forward.
    /// @dev Same 3.5-day value as ROUND_DURATION, written the same way because "3.5 days" is invalid syntax.
    uint256 public constant WITHDRAWAL_WINDOW = 3 days + 12 hours;

    /// @notice The current round number. Starts at 0, which means "no round has started yet".
    /// @dev The first real round will be #1, which is why 0 is a useful "uninitialized" sentinel.
    uint256 public currentRoundId;

    /// @notice The address that owns/deploys the protocol. Set to msg.sender in the constructor.
    address public admin;

    /// @notice The Launchpad balance, used to seed early rounds. Declared now, used in a later step.
    uint256 public launchpadBalance;

    /// @notice Total admin fee revenue collected so far (in wei).
    /// @dev This simply accumulates the 10% fee from every deposit. Withdrawing it is a later step.
    uint256 public collectedFees;

    /// @notice Opens a brand-new round by advancing currentRoundId and recording its timestamps.
    /// @dev We can't assign a whole struct literal to `rounds[currentRoundId]` because `Round`
    ///      contains mappings, so we set each non-mapping field one at a time instead.
    function startRound() internal {
        currentRoundId += 1;

        Round storage r = rounds[currentRoundId];
        r.roundId = currentRoundId;
        r.startTime = block.timestamp;
        r.endTime = block.timestamp + ROUND_DURATION;
        r.resolved = false;
        r.closed = false;

        emit RoundStarted(currentRoundId, r.startTime, r.endTime);
    }

    /// @notice Lets a user deposit ETH into a chosen option for the current round.
    /// @dev This uses "lazy" round advancement: since there is no off-chain keeper bot yet, the
    ///      contract only checks/advances round state when someone actually calls deposit().
    ///      A keeper/poke function could be added later so rounds can advance even with zero
    ///      deposits, but that's out of scope for now.
    ///      NOTE: no reentrancy guard yet — deposit() only RECEIVES ETH and never sends any, so
    ///      there is no reentrancy risk. We'll add a guard when we write withdraw(), which sends ETH.
    function deposit(Option option) external payable {
        // Step A — advance the round if needed (lazy round progression).
        if (
            currentRoundId == 0 ||
            rounds[currentRoundId].closed ||
            block.timestamp >= rounds[currentRoundId].endTime
        ) {
            // If the round expired by time but was never marked closed, mark it closed first.
            if (
                currentRoundId != 0 &&
                block.timestamp >= rounds[currentRoundId].endTime &&
                !rounds[currentRoundId].closed
            ) {
                rounds[currentRoundId].closed = true;
            }
            startRound();
        }

        // Step B — validate the deposit (can't deposit zero ETH).
        if (msg.value == 0) {
            revert ZeroDeposit();
        }

        // Step C — calculate the 10% fee and the net (post-fee) amount.
        uint256 fee = (msg.value * ADMIN_FEE_BPS) / 10_000;
        uint256 netAmount = msg.value - fee;

        // Step D — enforce the per-wallet, per-option cap on the NET amount.
        if (userStake[currentRoundId][msg.sender][option] + netAmount > MAX_STAKE_PER_OPTION) {
            revert ExceedsMaxStake(
                userStake[currentRoundId][msg.sender][option] + netAmount,
                MAX_STAKE_PER_OPTION
            );
        }

        // Step E — count new participants (each unique address counts once per option per round).
        if (!hasDeposited[currentRoundId][msg.sender][option]) {
            hasDeposited[currentRoundId][msg.sender][option] = true;
            rounds[currentRoundId].participantCount[option] += 1;
        }

        // Step F — bookkeeping: record the stake, the option total, the round volume, and the fee.
        userStake[currentRoundId][msg.sender][option] += netAmount;
        rounds[currentRoundId].totalDeposited[option] += netAmount;
        rounds[currentRoundId].totalVolume += netAmount;
        collectedFees += fee;

        // Step G — check for an early close once total volume hits the 100 ETH cap.
        if (rounds[currentRoundId].totalVolume >= EARLY_CLOSE_VOLUME) {
            rounds[currentRoundId].closed = true;
        }

        // Step H — emit the deposit event.
        emit Deposited(currentRoundId, msg.sender, option, msg.value, netAmount, fee);
    }

    // PAYOUT FORMULA (used by withdraw(), a later step):
    //   payout = userStake[roundId][user][option] * r.totalVolume / r.winningPoolTotal
    // This single formula correctly handles all three cases:
    //   - One winner: winningPoolTotal == that option's total, so each winner gets their stake back
    //     plus a share of the two losing pools, proportional to their stake within the winning option.
    //   - Two-way tie: winningPoolTotal == the sum of both tied options' totals, so the third
    //     (losing) option's pool is split between the two tied options' stakers, proportional to
    //     each staker's share of the combined winning pool.
    //   - Three-way tie: winningPoolTotal == totalVolume (no losers exist), so the formula reduces to
    //     payout == userStake, meaning everyone simply gets their own net deposit back.
    // This function only ever reads from an option a user actually staked in; a user who staked in a
    // losing option gets 0 from that option, which withdraw() will handle by checking isWinningOption.

    /// @notice Resolves a round by finding the least-deposited option(s).
    /// @dev Permissionless — anyone may call it because the outcome is fully deterministic from data
    ///      already stored on-chain (no oracle needed). The round must be closed first.
    function resolveRound(uint256 roundId) external {
        Round storage r = rounds[roundId];

        // 1. Can't resolve a round that's already been resolved.
        if (r.resolved) {
            revert RoundAlreadyResolved(roundId);
        }

        // 2. The round must be closed before it can be resolved. It counts as closed if EITHER
        //    r.closed is already true, OR the round expired by time (block.timestamp >= r.endTime).
        if (!r.closed && block.timestamp < r.endTime) {
            revert RoundNotYetClosed(roundId);
        }
        // If it qualifies only via the time-expiry path, flip the closed flag now.
        if (!r.closed) {
            r.closed = true;
        }

        // 3. Read the three option totals into locals for clarity (no loops needed for 3 values).
        uint256 a = r.totalDeposited[Option.A];
        uint256 b = r.totalDeposited[Option.B];
        uint256 c = r.totalDeposited[Option.C];

        // 4. Find the minimum of the three.
        uint256 minVal = a;
        if (b < minVal) minVal = b;
        if (c < minVal) minVal = c;

        // 5. Determine which option(s) match that minimum — this yields 1, 2, or 3 winners on ties.
        bool aWon = (a == minVal);
        bool bWon = (b == minVal);
        bool cWon = (c == minVal);

        // 6. Store the results.
        r.isWinningOption[Option.A] = aWon;
        r.isWinningOption[Option.B] = bWon;
        r.isWinningOption[Option.C] = cWon;
        r.winningPoolTotal = (aWon ? a : 0) + (bWon ? b : 0) + (cWon ? c : 0);

        // 7. Set the single `winner` field ONLY when exactly one option won. This keeps that field
        //    meaningful for the common case and easy front-end display, while isWinningOption remains
        //    the authoritative source of truth for payout math (including ties).
        uint8 winnerCount = (aWon ? 1 : 0) + (bWon ? 1 : 0) + (cWon ? 1 : 0);
        if (winnerCount == 1) {
            r.winner = aWon ? Option.A : (bWon ? Option.B : Option.C);
        }

        // 8. Mark resolved and record when, so withdraw() can enforce the withdrawal window later.
        r.resolved = true;
        r.resolvedTime = block.timestamp;

        // 9. Emit the resolution event.
        emit RoundResolved(roundId, aWon, bWon, cWon, r.winningPoolTotal);
    }

    /// @notice Sets the admin to whoever deploys the contract.
    // TODO: accept launchpad countdown duration as a constructor parameter in a later step (network-dependent: 24 hours on testnet, mainnet value TBD)
    constructor() {
        admin = msg.sender;
    }
}
