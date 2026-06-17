# Ecto Treasury

A lightweight treasury contract designed to serve as the financial backbone of the PhanicVerse ecosystem.

The Ecto Treasury is responsible for receiving and securely storing both native blockchain assets and approved ERC-20 tokens while emitting standardized deposit events that can be consumed by off-chain services such as indexers, ledgers, reward systems, and future ECTO infrastructure.

The contract is intentionally minimal and focused on treasury operations, keeping business logic and ecosystem mechanics off-chain where they can evolve without requiring contract upgrades.

---

## Features

- Accept native currency deposits (ETH, S, etc.)
- Accept approved ERC-20 token deposits
- Emit standardized deposit events
- Owner-controlled treasury withdrawals
- ERC-20 token withdrawals
- Emergency full-balance token withdrawals
- Pausable operations
- ERC-20 token whitelist
- Event-driven architecture for off-chain indexing
- Comprehensive unit test coverage

---

## Supported Deposit Types

### Native Currency

Users can deposit the native asset of the chain directly into the treasury.

Examples:
- Ethereum → ETH
- Sonic → S

Deposits can be made through direct transfers or dedicated deposit functions depending on the integration.

### ERC-20 Tokens

Only approved tokens may be deposited.

Examples include:

- USDC
- USDT
- PHANIC
- Future expansions can be considered

---

## Events

The treasury emits standardized events designed for consumption by external indexers and accounting systems.

### Deposit

```solidity
event Deposit(
    address indexed user,
    address indexed token,
    uint256 amount
);
```

Native currency deposits use:

```solidity
token = address(0)
```

ERC-20 deposits use:

```solidity
token = tokenAddress
```

---


## Design Philosophy

The treasury is intentionally kept simple.

Responsibilities include:

- Receiving assets
- Holding assets
- Emitting events
- Processing withdrawals

Responsibilities intentionally excluded:

- ECTO accounting
- User balances
- Reward calculations
- Slot mechanics
- NFT rewards
- Staking rewards
- Marketplace logic

These systems are handled off-chain and may evolve independently from the treasury.

---

## ECTO Integration

The treasury serves as the entry point into the ECTO ecosystem.

External indexers can monitor treasury events and convert deposits into ECTO ledger entries.

Example flow:

```text
User Deposit
      ↓
Treasury Event
      ↓
Indexer
      ↓
ECTO Ledger
      ↓
Games / Utilities / Rewards
```

This architecture allows the ecosystem to operate across multiple chains while maintaining a unified off-chain accounting layer.

---

## Multi-Chain Ready

The treasury is designed to be deployed across multiple EVM-compatible networks. It is planned
for integration between Sonic and Ethereum specially, but other chains aren't discarded.

Examples:
- Ethereum
- Sonic
- Polygon
- Arbitrum
- Base

Each deployment emits the same event structure, simplifying indexer implementation and future ecosystem expansion.

---

## Security

The treasury incorporates several security-focused design decisions:

- Token whitelist enforcement
- Ownership-based access control
- Pausable operations
- Safe ERC-20 transfers
- Minimal attack surface
- No external business logic execution

The contract does not custody user balances beyond treasury deposits and does not perform reward calculations or gambling logic.

---

## Testing

The repository includes a comprehensive unit test suite covering:

### Native Deposits

- Successful deposits
- Direct transfers
- Zero-value rejections
- Paused state behavior

### ERC-20 Deposits

- Successful deposits
- Unsupported token rejections
- Allowance validation
- Balance validation

### Withdrawals

- Native asset withdrawals
- ERC-20 withdrawals
- Full token withdrawals
- Access control validation

### Administration

- Ownership restrictions
- Pause functionality
- Token whitelist management

### Error Handling

- Invalid deposits
- Invalid withdrawals
- Unsupported tokens
- Unauthorized access attempts

All contract functionality is covered by automated tests.

---


## Future Ecosystem Usage

The Ecto Treasury is intended to become a foundational component of the broader PhanicVerse ecosystem.

Future integrations may include:

- ECTO Ledger
- ECTO-powered games
- NFT acquisition systems
- Staking utilities
- Cross-chain participation rewards
- Marketplace integrations
- Ecosystem incentive programs

---

## License

MIT