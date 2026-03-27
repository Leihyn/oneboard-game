# OneBoard

The DeFi Board Game on OneChain.

A Monopoly-style board game where every property is a real OneChain protocol. Buy, upgrade, and compete over OneDEX, OneRWA, OCT Staking, and more while three LLM-powered AI opponents try to bankrupt you.

**Live:** https://oneboard-mauve.vercel.app

## Quick Start

```bash
cd frontend
npm install
cp .env.local.example .env.local  # add your keys
npm run dev
```

Open http://localhost:3000 and connect your OneWallet.

## Project Structure

```
contracts/       Move smart contracts (game, board, player, property, token)
frontend/        Next.js 15 app (TypeScript, Tailwind CSS)
video/           Remotion demo video project
```

## Tech Stack

- **Smart Contracts:** Move on OneChain testnet
- **Frontend:** Next.js 15, TypeScript, Tailwind CSS, Lucide React
- **Wallet:** OneWallet via @onelabs/dapp-kit
- **AI:** Groq (Llama 3.1 8B) for personality-driven trash talk
- **On-chain:** SuiClient for transaction signing and state polling

## Smart Contract

Package ID: `0x8a75fedd764a6cf18d73a6e9756451dce7ebe7b10f08f05ab4888968c1ea39db`

Deployed on OneChain testnet. Five modules: game, board, player, property, token.

## Team

Solo developer: Faruq Onatola (onatolafaruq@gmail.com)

Built for OneHack 3.0 AI-GameFi 2026.
