# TRIODE

A transparent, on-chain reflexive market protocol built on Robinhood Chain.

## Repo layout

```
triode/
├── contracts/   # Hardhat smart contracts (Solidity)
└── frontend/    # Vite + React dapp UI
```

## contracts/

Hardhat project containing the `TriodeMarket` contract.

```bash
cd contracts
npm install
npx hardhat test
```

Copy `.env.example` to `.env` and fill in your values before deploying.

## frontend/

Vite + React dapp UI (wagmi + viem).

```bash
cd frontend
npm install
npm run dev
```

Copy `.env.example` to `.env` and fill in your values before running.

Whitepaper: https://bit.ly/TriodeWhitepaper