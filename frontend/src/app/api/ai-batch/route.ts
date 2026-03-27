import { NextRequest, NextResponse } from "next/server";
import { SuiClient } from "@onelabs/sui/client";
import { Transaction } from "@onelabs/sui/transactions";
import { Ed25519Keypair } from "@onelabs/sui/keypairs/ed25519";

const RPC = process.env.NEXT_PUBLIC_ONECHAIN_RPC || "https://rpc-testnet.onelabs.cc:443";
const PACKAGE_ID = process.env.NEXT_PUBLIC_PACKAGE_ID || "0x0";
const CLOCK = "0x6";

// Server keypair for signing AI transactions
function getServerKeypair(): Ed25519Keypair | null {
  const key = process.env.SERVER_PRIVATE_KEY;
  if (!key) return null;
  try {
    const raw = Buffer.from(key, "base64");
    return Ed25519Keypair.fromSecretKey(raw.slice(raw[0] === 0 ? 1 : 0));
  } catch {
    return null;
  }
}

interface AIAction {
  playerIndex: number;
  actions: ("roll" | "buy" | "skip" | "end")[];
}

export async function POST(request: NextRequest) {
  try {
    const { gameId, aiActions } = (await request.json()) as {
      gameId: string;
      aiActions: AIAction[];
    };

    const keypair = getServerKeypair();
    if (!keypair) {
      return NextResponse.json({ error: "Server keypair not configured" }, { status: 500 });
    }

    const client = new SuiClient({ url: RPC });

    // Build a single PTB with all AI actions
    const tx = new Transaction();

    for (const ai of aiActions) {
      for (const action of ai.actions) {
        switch (action) {
          case "roll":
            tx.moveCall({
              target: `${PACKAGE_ID}::game::ai_roll_dice`,
              arguments: [tx.object(gameId), tx.pure.u64(ai.playerIndex), tx.object(CLOCK)],
            });
            break;
          case "buy":
            tx.moveCall({
              target: `${PACKAGE_ID}::game::ai_buy_property`,
              arguments: [tx.object(gameId), tx.pure.u64(ai.playerIndex)],
            });
            break;
          case "end":
            tx.moveCall({
              target: `${PACKAGE_ID}::game::ai_end_turn`,
              arguments: [tx.object(gameId), tx.pure.u64(ai.playerIndex)],
            });
            break;
        }
      }
    }

    const result = await client.signAndExecuteTransaction({
      signer: keypair,
      transaction: tx,
      options: { showEvents: true, showEffects: true },
    });

    return NextResponse.json({
      digest: result.digest,
      status: result.effects?.status?.status,
      events: result.events?.map((e: any) => ({
        type: e.type.split("::").pop(),
        data: e.parsedJson,
      })),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "AI batch failed" },
      { status: 500 }
    );
  }
}
