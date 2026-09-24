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

    /// @notice Sets the admin to whoever deploys the contract.
    // TODO: accept launchpad countdown duration as a constructor parameter in a later step (network-dependent: 24 hours on testnet, mainnet value TBD)
    constructor() {
        admin = msg.sender;
    }
}
