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

contract TriodeMarket {}
