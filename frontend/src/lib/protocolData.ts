// Live protocol data for OneChain properties
// In production this would fetch from on-chain or API; for the hackathon
// we use realistic mock data that updates with small random jitter each render.

export interface ProtocolMetrics {
  tvl: string;
  apy: string;
  users: string;
  change24h: number; // percent, positive or negative
}

// Base values — realistic for a testnet/early protocol ecosystem
const BASE_METRICS: Record<number, { tvl: number; apy: number; users: number }> = {
  1:  { tvl: 2_340_000,  apy: 12.5,  users: 1_240  }, // OnePlay
  3:  { tvl: 8_120_000,  apy: 6.2,   users: 3_410  }, // OneRWA
  4:  { tvl: 14_800_000, apy: 8.7,   users: 8_920  }, // OneDEX
  6:  { tvl: 11_200_000, apy: 5.4,   users: 5_670  }, // OCT Staking
  7:  { tvl: 6_750_000,  apy: 18.3,  users: 2_890  }, // OneDEX LP
  9:  { tvl: 9_400_000,  apy: 4.8,   users: 4_120  }, // USDO Vault
  11: { tvl: 3_200_000,  apy: 0,     users: 12_450 }, // OneTransfer (no APY, it's a bridge)
  12: { tvl: 5_600_000,  apy: 7.1,   users: 3_780  }, // OnePredict
  14: { tvl: 1_890_000,  apy: 22.4,  users: 960    }, // OnePoker
  15: { tvl: 4_100_000,  apy: 15.8,  users: 2_340  }, // OneNFT
};

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

function formatUsers(n: number): string {
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

// Add small random jitter to make it feel "live"
function jitter(base: number, pct: number): number {
  return base * (1 + (Math.random() - 0.5) * 2 * pct);
}

export function getProtocolMetrics(spaceIndex: number): ProtocolMetrics | null {
  const base = BASE_METRICS[spaceIndex];
  if (!base) return null;

  const tvlJittered = jitter(base.tvl, 0.02);
  const change = (Math.random() - 0.45) * 8; // slightly biased positive

  return {
    tvl: formatNumber(tvlJittered),
    apy: base.apy > 0 ? `${(jitter(base.apy, 0.05)).toFixed(1)}%` : "--",
    users: formatUsers(Math.round(jitter(base.users, 0.01))),
    change24h: Math.round(change * 10) / 10,
  };
}
