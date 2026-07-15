# SimplyVest Arc — Deployment Guide

## Prerequisites

- [Foundry](https://book.getfoundry.sh/getting-started/installation)
- A wallet with testnet USDC on Arc Testnet
- Registered on [Circle Faucet](https://faucet.circle.com)

## Network Details

| Parameter | Value |
|-----------|-------|
| Network | Arc Testnet |
| Chain ID | `5042002` |
| RPC URL | `https://rpc.testnet.arc.network` |
| Currency | USDC (18 decimals) |
| Explorer | `https://testnet.arcscan.app` |
| Faucet | `https://faucet.circle.com` |

## Step 1: Get Testnet USDC

1. Visit https://faucet.circle.com
2. Select **Arc Testnet**
3. Paste your wallet address
4. Request testnet USDC (this is used for gas)

## Step 2: Configure Environment

```bash
cd contracts
cp .env.example .env
```

Edit `.env` and add your private key:
```
PRIVATE_KEY=your_wallet_private_key_here
```

> **Security:** Never commit `.env`. It's in `.gitignore`.

## Step 3: Deploy SimplyVestFactory

```bash
# Using a private key from .env
forge script script/DeployFactory.s.sol:DeployFactory \
  --rpc-url arc_testnet \
  --broadcast \
  -vvvv
```

## Step 4: Verify on Explorer

```bash
forge verify-contract <FACTORY_ADDRESS> \
  src/SimplyVestFactory.sol:SimplyVestFactory \
  --rpc-url arc_testnet \
  --verifier-url https://testnet.arcscan.app/api/ \
  --etherscan-api-key <optional>
```

## Step 5: Update Frontend

Copy the deployed factory address into `app/.env.local`:
```
VITE_FACTORY_ADDRESS=0x...
```

The app will now:
1. Check the factory for your user-specific SimplyVest contract
2. Prompt you to deploy one if none exists
3. Use your personal contract for all operations

## Deployments

| Network | Contract | Address | Block | Date |
|---------|---------|---------|-------|------|
| Arc Testnet | SimplyVestFactory | TBD | TBD | TBD |

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| `insufficient funds` | No USDC for gas | Request from faucet |
| `execution reverted` | Contract validation failed | Check event logs via explorer |
| `nonce too low` | Stale local nonce | Reset with `eth_nonce` or wait for pending tx |
