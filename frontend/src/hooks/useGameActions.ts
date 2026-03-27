"use client";

import { useSignAndExecuteTransaction, useSuiClient } from "@onelabs/dapp-kit";
import { Transaction } from "@onelabs/sui/transactions";
import { PACKAGE_ID } from "@/lib/constants";

const CLOCK = "0x6";

export function useGameActions() {
  const client = useSuiClient();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();

  const createSoloGame = async (): Promise<string | null> => {
    const tx = new Transaction();
    tx.moveCall({
      target: `${PACKAGE_ID}::game::create_game`,
      arguments: [tx.object(CLOCK)],
    });

    const result = await signAndExecute({ transaction: tx });
    const details = await client.waitForTransaction({
      digest: result.digest,
      options: { showObjectChanges: true },
    });

    const gameObj = details.objectChanges?.find(
      (c: any) => c.type === "created" && c.objectType?.includes("::game::Game")
    );
    return gameObj && "objectId" in gameObj ? gameObj.objectId : null;
  };

  const createPvpGame = async (maxPlayers: number): Promise<string | null> => {
    const tx = new Transaction();
    tx.moveCall({
      target: `${PACKAGE_ID}::game::create_pvp_game`,
      arguments: [tx.pure.u64(maxPlayers)],
    });

    const result = await signAndExecute({ transaction: tx });
    const details = await client.waitForTransaction({
      digest: result.digest,
      options: { showObjectChanges: true },
    });

    const gameObj = details.objectChanges?.find(
      (c: any) => c.type === "created" && c.objectType?.includes("::game::Game")
    );
    return gameObj && "objectId" in gameObj ? gameObj.objectId : null;
  };

  const joinGame = async (gameId: string): Promise<string> => {
    const tx = new Transaction();
    tx.moveCall({
      target: `${PACKAGE_ID}::game::join_game`,
      arguments: [tx.object(gameId)],
    });
    const result = await signAndExecute({ transaction: tx });
    return result.digest;
  };

  const startGame = async (gameId: string): Promise<string> => {
    const tx = new Transaction();
    tx.moveCall({
      target: `${PACKAGE_ID}::game::start_game`,
      arguments: [tx.object(gameId)],
    });
    const result = await signAndExecute({ transaction: tx });
    return result.digest;
  };

  const rollDice = async (gameId: string): Promise<string> => {
    const tx = new Transaction();
    tx.moveCall({
      target: `${PACKAGE_ID}::game::roll_dice`,
      arguments: [tx.object(gameId), tx.object(CLOCK)],
    });
    const result = await signAndExecute({ transaction: tx });
    return result.digest;
  };

  const buyProperty = async (gameId: string): Promise<string> => {
    const tx = new Transaction();
    tx.moveCall({
      target: `${PACKAGE_ID}::game::buy_property`,
      arguments: [tx.object(gameId)],
    });
    const result = await signAndExecute({ transaction: tx });
    return result.digest;
  };

  const skipBuy = async (gameId: string): Promise<string> => {
    const tx = new Transaction();
    tx.moveCall({
      target: `${PACKAGE_ID}::game::skip_buy`,
      arguments: [tx.object(gameId)],
    });
    const result = await signAndExecute({ transaction: tx });
    return result.digest;
  };

  const upgradeProperty = async (gameId: string, nftId: string, spaceIndex: number): Promise<string> => {
    const tx = new Transaction();
    tx.moveCall({
      target: `${PACKAGE_ID}::game::upgrade_property`,
      arguments: [tx.object(gameId), tx.object(nftId), tx.pure.u8(spaceIndex)],
    });
    const result = await signAndExecute({ transaction: tx });
    return result.digest;
  };

  const endTurn = async (gameId: string): Promise<string> => {
    const tx = new Transaction();
    tx.moveCall({
      target: `${PACKAGE_ID}::game::end_turn`,
      arguments: [tx.object(gameId)],
    });
    const result = await signAndExecute({ transaction: tx });
    return result.digest;
  };

  return {
    createSoloGame,
    createPvpGame,
    joinGame,
    startGame,
    rollDice,
    buyProperty,
    skipBuy,
    upgradeProperty,
    endTurn,
  };
}
