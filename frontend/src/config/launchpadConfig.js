// Launchpad countdown-to-launch duration, keyed by chain id.
//
// The countdown duration is network-dependent: testnet uses a short 24-hour countdown so the
// full countdown-to-launch flow can be tested quickly, while mainnet uses the real 2-month window.
export const LAUNCHPAD_COUNTDOWN_SECONDS = {
  // Mainnet (chain id 4663) — 2 months, approximated as 60 days.
  4663: 60 * 60 * 24 * 60,
  // Testnet (chain id 46630) — 24 hours.
  46630: 60 * 60 * 24,
};
