import { SuiClient } from "@onelabs/sui/client";
import { ONECHAIN_RPC } from "./constants";

export const suiClient = new SuiClient({ url: ONECHAIN_RPC });
