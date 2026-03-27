import { SuiClient } from "@onelabs/sui/client";
import { Transaction } from "@onelabs/sui/transactions";
import { Ed25519Keypair } from "@onelabs/sui/keypairs/ed25519";
import { readFileSync } from "fs";
import path from "path";

const RPC = "https://rpc-testnet.onelabs.cc:443";
const PACKAGE_ID = "0x62dea5bec418ffb4a1c09fdbd0a780fdcd69131195e6334602dc69d808d425f8";
const CLOCK = "0x6";

const client = new SuiClient({ url: RPC });
const keystore = JSON.parse(readFileSync(path.join(process.env.HOME, ".sui/sui_config/sui.keystore"), "utf8"));
const raw = Buffer.from(keystore[0], "base64");
const keypair = Ed25519Keypair.fromSecretKey(raw.slice(1));
const address = keypair.getPublicKey().toSuiAddress();

console.log("Testing from:", address);

// Test 1: Create solo game
console.log("\n=== Test 1: Create Solo Game ===");
const tx1 = new Transaction();
tx1.moveCall({ target: `${PACKAGE_ID}::game::create_game`, arguments: [tx1.object(CLOCK)] });
const r1 = await client.signAndExecuteTransaction({ signer: keypair, transaction: tx1, options: { showEvents: true, showObjectChanges: true } });
console.log("Status:", r1.effects?.status?.status);
const gameObj = r1.objectChanges?.find(c => c.type === "created" && c.objectType?.includes("::game::Game"));
console.log("Game:", gameObj?.objectId);
r1.events?.forEach(e => console.log("Event:", e.type.split("::").pop(), JSON.stringify(e.parsedJson)));

// Test 2: Roll dice (should also mint NFT on buy)
if (gameObj) {
  console.log("\n=== Test 2: Roll Dice ===");
  const tx2 = new Transaction();
  tx2.moveCall({ target: `${PACKAGE_ID}::game::roll_dice`, arguments: [tx2.object(gameObj.objectId), tx2.object(CLOCK)] });
  const r2 = await client.signAndExecuteTransaction({ signer: keypair, transaction: tx2, options: { showEvents: true } });
  console.log("Status:", r2.effects?.status?.status);
  r2.events?.forEach(e => console.log("Event:", e.type.split("::").pop(), JSON.stringify(e.parsedJson)));

  // Test 3: Buy property (should mint NFT)
  console.log("\n=== Test 3: Buy Property ===");
  const tx3 = new Transaction();
  tx3.moveCall({ target: `${PACKAGE_ID}::game::buy_property`, arguments: [tx3.object(gameObj.objectId)] });
  const r3 = await client.signAndExecuteTransaction({ signer: keypair, transaction: tx3, options: { showEvents: true, showObjectChanges: true } });
  console.log("Status:", r3.effects?.status?.status);
  r3.events?.forEach(e => console.log("Event:", e.type.split("::").pop(), JSON.stringify(e.parsedJson)));
  const nft = r3.objectChanges?.find(c => c.type === "created" && c.objectType?.includes("PropertyNFT"));
  if (nft) console.log("NFT Minted!", nft.objectId, nft.objectType);

  // Test 4: Create PvP game
  console.log("\n=== Test 4: Create PvP Lobby ===");
  const tx4 = new Transaction();
  tx4.moveCall({ target: `${PACKAGE_ID}::game::create_pvp_game`, arguments: [tx4.pure.u64(3)] });
  const r4 = await client.signAndExecuteTransaction({ signer: keypair, transaction: tx4, options: { showEvents: true, showObjectChanges: true } });
  console.log("Status:", r4.effects?.status?.status);
  r4.events?.forEach(e => console.log("Event:", e.type.split("::").pop(), JSON.stringify(e.parsedJson)));

  // Test 5: Mint demo NFT (Workshop)
  console.log("\n=== Test 5: Mint Demo NFT (Workshop) ===");
  const tx5 = new Transaction();
  tx5.moveCall({ target: `${PACKAGE_ID}::game::mint_demo_nft`, arguments: [tx5.pure.u8(4)] });
  const r5 = await client.signAndExecuteTransaction({ signer: keypair, transaction: tx5, options: { showEvents: true, showObjectChanges: true } });
  console.log("Status:", r5.effects?.status?.status);
  const demoNft = r5.objectChanges?.find(c => c.type === "created" && c.objectType?.includes("PropertyNFT"));
  if (demoNft) console.log("Demo NFT Minted!", demoNft.objectId);
}
