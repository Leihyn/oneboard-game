# OneBoard

## The Problem

A new user hears about DeFi. They see OneDEX, OneRWA, staking, liquidity pools. Dozens of protocols, each with its own mechanics. The learning curve is steep and the risk of losing real money makes experimentation terrifying.

There is no safe, fun way to explore an entire DeFi ecosystem without putting capital at risk.

## The Solution

OneBoard is a Monopoly style board game built on OneChain. You buy, upgrade, and compete over real OneChain protocols while three AI opponents try to bankrupt you.

Every board space is a real protocol in the OneChain ecosystem. OneDEX, OneRWA, OCT Staking, OneDEX LP, OnePoker, OneNFT, OnePredict, OneTransfer. You learn the ecosystem by playing it.

The AI opponents are not generic bots. Each one has a distinct personality powered by Groq LLM. The Degen Trader apes into everything and trash talks in crypto slang. The Conservative Whale only buys when the math is right and speaks in TradFi jargon. The MEV Bot calculates expected value on every move and talks like a cold algorithm.

## How It Works

**Connect your OneWallet and click Play Now.** The game registers on chain immediately. You roll dice, land on protocol spaces, and decide whether to buy, auction, or skip. AI opponents take their turns and roast you in real time through the Live Game Feed.

**Own a full category set and you can upgrade.** A basic OneDEX becomes an AMM, then a Hybrid, then a Full Orderbook. Rent goes up with each level. The game ends when all opponents are bankrupt.

**Win and you mint a Victory NFT.** One wallet signature at the start, one at the end. The game itself runs at full speed with zero transaction popups.

## Features

- 16 board spaces representing the OneChain protocol ecosystem
- 3 AI opponents with LLM powered personalities and real time trash talk
- OneWallet integration with on chain game creation and Victory NFT minting
- PvP multiplayer through Move smart contracts on OneChain testnet
- Live Game Feed showing AI conversation, actions, and game events
- CRT TV screen display in the board center
- Proportional jail bail (stays 2 turns at 500 OCT, or 1 turn at 250 OCT)
- Property upgrades with full set bonuses
- Three difficulty levels (Easy, Normal, Hard)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React, Tailwind CSS |
| Wallet | OneWallet via @onelabs/dapp-kit |
| Smart Contracts | Move on OneChain testnet |
| AI | Groq API (Llama 3.1 8B) for personality driven trash talk |
| Fonts | Space Grotesk (headings), DM Sans (body) |

## Smart Contract

Deployed on OneChain testnet.

**Package ID:** `0x8a75fedd764a6cf18d73a6e9756451dce7ebe7b10f08f05ab4888968c1ea39db`

Modules: `game`, `board`, `player`, `property`

9 on chain actions: `create_game`, `create_pvp_game`, `join_game`, `start_game`, `roll_dice`, `buy_property`, `skip_buy`, `upgrade_property`, `end_turn`

## Quick Start

```bash
git clone https://github.com/Leihyn/oneboard.git
cd oneboard
npm install
```

Create a `.env.local` file:

```
NEXT_PUBLIC_PACKAGE_ID=0x8a75fedd764a6cf18d73a6e9756451dce7ebe7b10f08f05ab4888968c1ea39db
NEXT_PUBLIC_ONECHAIN_RPC=https://rpc-testnet.onelabs.cc:443
GROQ_API_KEY=your_groq_api_key
```

You need a Groq API key for AI trash talk. Get one free at https://console.groq.com. Without it, AI opponents still play and talk using preset lines.

```bash
npm run dev
```

Open http://localhost:3000, connect OneWallet, and play.

## Troubleshooting

**"All endpoints failed" in OneWallet when signing**
The OneChain testnet RPC may be temporarily unreachable. Click Sign anyway. The transaction usually goes through. If it fails, the game falls back to local mode automatically.

**AI turns feel slow**
The Groq API call runs in the background and does not block gameplay. If your first game feels slow, it is the Next.js API route cold starting. Subsequent turns are fast.

**Game stuck on "thinking..."**
The Groq API has a 3 second timeout. If it hangs, the game skips the trash talk and continues. Refresh if it persists.

## Screenshots

*Coming soon*

## Team

*Coming soon*
