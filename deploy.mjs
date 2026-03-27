import { SuiClient } from "@onelabs/sui/client";
import { Transaction } from "@onelabs/sui/transactions";
import { Ed25519Keypair } from "@onelabs/sui/keypairs/ed25519";
import { execSync } from "child_process";
import { readFileSync } from "fs";
import path from "path";

const RPC = "https://rpc-testnet.onelabs.cc:443";
const client = new SuiClient({ url: RPC });

// Load keypair from Sui keystore (base64 encoded, first byte is scheme flag)
const keystorePath = path.join(process.env.HOME, ".sui/sui_config/sui.keystore");
const keystore = JSON.parse(readFileSync(keystorePath, "utf8"));
const raw = Buffer.from(keystore[0], "base64");
// First byte is the key scheme (0 = ed25519), rest is the 32-byte secret key
const secretKey = raw.slice(1);
const keypair = Ed25519Keypair.fromSecretKey(secretKey);
const address = keypair.getPublicKey().toSuiAddress();

console.log("Deploying from:", address);

// Skip build — use existing bytecode from contracts/build/

// Read compiled modules
const buildPath = "./contracts/build/oneopoly/bytecode_modules";
const { readdirSync } = await import("fs");
const moduleFiles = readdirSync(buildPath).filter(f => f.endsWith(".mv"));
const modules = moduleFiles.map(f => {
  const bytes = readFileSync(path.join(buildPath, f));
  return Array.from(bytes);
});

console.log(`Found ${modules.length} modules:`, moduleFiles);

// Read package dependencies
const depPath = "./contracts/build/oneopoly/bytecode_modules/../source_maps";

// Build publish transaction
const tx = new Transaction();
const [upgradeCap] = tx.publish({
  modules: modules.map(m => Uint8Array.from(m)),
  dependencies: [
    "0x0000000000000000000000000000000000000000000000000000000000000001", // MoveStdlib
    "0x0000000000000000000000000000000000000000000000000000000000000002", // Sui/One Framework
  ],
});
tx.transferObjects([upgradeCap], address);

console.log("Publishing to OneChain testnet...");
try {
  const result = await client.signAndExecuteTransaction({
    signer: keypair,
    transaction: tx,
    options: {
      showEffects: true,
      showObjectChanges: true,
    },
  });

  console.log("\nTransaction digest:", result.digest);
  console.log("Status:", result.effects?.status?.status);

  const published = result.objectChanges?.filter(c => c.type === "published");
  if (published?.length) {
    console.log("\nPackage ID:", published[0].packageId);
    console.log("Modules:", published[0].modules);
  }

  const created = result.objectChanges?.filter(c => c.type === "created");
  if (created?.length) {
    console.log("\nCreated objects:");
    created.forEach(obj => {
      console.log(`  ${obj.objectId} (${obj.objectType})`);
    });
  }
} catch (e) {
  console.error("Publish failed:", e.message);
  if (e.cause) console.error("Cause:", e.cause);
}
