# OneBoard: The DeFi Board Game on OneChain

## The Problem

DeFi is intimidating. New users face a wall of jargon. Liquidity pools, staking, yield farming, MEV. The learning curve keeps millions from ever touching on-chain protocols. Meanwhile, existing blockchain games feel like thinly veiled token farms with no real gameplay.

What if learning DeFi felt like a Friday night board game?

## The Solution

**OneBoard** is a Monopoly-style board game where every property is a real OneChain protocol. Players roll dice, buy protocols, charge rent, and compete against AI opponents, all while learning how DeFi actually works.

The twist: every game action happens on-chain. Buy a property? That's a Move smart contract call. Win the game? Mint a Victory NFT. It's education through gameplay, powered by OneChain.

## How It Works

**Solo Mode (1 vs 3 AI)**
- Connect your OneWallet and start a game
- Roll dice to move around a 16-space board featuring real OneChain protocols (OneDEX, OneRWA, OCT Staking, etc.)
- Buy properties, collect rent, upgrade when you own a full category set
- Outsmart three LLM-powered AI opponents, each with a distinct personality:
  - **Degen Trader** buys everything, talks trash, pure YOLO
  - **Conservative Whale** waits for value, plays the long game
  - **MEV Bot** pure math, no mercy, optimal decisions

**PvP Multiplayer**
- Create or join a lobby, share the game ID
- 2-4 players, fully on-chain. Every roll, purchase, and upgrade is a transaction
- Real-time state synced from the blockchain

**Dynamic NFTs**
- Every property purchase mints an NFT that evolves as you upgrade
- Winners mint a Victory NFT as proof of their DeFi mastery

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Smart Contracts | Move on OneChain testnet |
| Frontend | Next.js 15, TypeScript, Tailwind CSS |
| Wallet | OneWallet via @onelabs/dapp-kit |
| AI Opponents | Groq (Llama 3.1 8B) for trash talk + personality-driven decision engine |
| Icons | Lucide React |
| On-chain | SuiClient for transaction signing and state polling |

## Smart Contract Architecture

Five Move modules handle all game logic on-chain:

- **game.move** Core game lifecycle (create, join, start, end), turn management, winner determination
- **board.move** Board space definitions, property metadata, space effects (tax, jail, airdrop, etc.)
- **player.move** Player state: balance, position, jail status, owned properties
- **property.move** Property ownership, upgrades, rent calculation, NFT minting
- **token.move** OCT token operations for in-game economy

## Features

- **Full OneWallet integration** wallet required to play, all game actions are signed transactions
- **On-chain game state** game creation, dice rolls, property purchases, upgrades all happen through Move smart contracts
- **3 AI personalities** with LLM-powered trash talk that reacts to game state
- **Dynamic NFTs** that evolve through 3 upgrade tiers per property category
- **Live protocol metrics** each board space shows simulated TVL and 24h change
- **DeFi IQ Score** post-game analytics showing your category coverage and strategy rating
- **Shareable Victory Card** one-click share to X/Twitter
- **Interactive tutorial** first-time players get a guided walkthrough
- **CRT TV aesthetic** retro-futuristic board center with scanlines and glow effects
- **PvP multiplayer** on-chain lobbies with real-time state polling

## What Makes OneBoard Different

Most blockchain games bolt a token onto existing gameplay. OneBoard does the opposite. The gameplay IS the blockchain interaction. Every move teaches you something:

- Buying **OneDEX** teaches you what a DEX is
- Upgrading from "Basic LP" to "Protocol-owned" mirrors real liquidity progression
- Getting "Rug Pulled" (-50% balance) is a lesson you won't forget
- Paying "Gas Tax" makes gas fees tangible

The AI opponents model real DeFi archetypes. The degen who apes into everything, the whale who waits for value, the bot that plays pure math.

## Team

**Solo Developer**
- Name: Faruq Onatola
- Email: onatolafaruq@gmail.com
- Role: Full-stack development, smart contracts, game design, AI integration

## Links

- **Live Website**: https://oneboard-mauve.vercel.app
- **GitHub**: https://github.com/Leihyn/oneboard-game
- **Smart Contracts**: Deployed on OneChain testnet
- **Package ID**: `0x8a75fedd764a6cf18d73a6e9756451dce7ebe7b10f08f05ab4888968c1ea39db`
