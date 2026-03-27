import { NextRequest, NextResponse } from "next/server";

const AI_PERSONALITIES = {
  degen: {
    name: "Degen Trader",
    systemPrompt: `You are the Degen Trader, a reckless crypto gambler in OneBoard. You LOVE buying everything, upgrading fast, and going all-in. You talk in crypto slang: "ape in", "to the moon", "WAGMI", "ngmi". You taunt other players aggressively but humorously. You never play it safe. Your motto: "Fortune favors the degen."

Decision rules:
- ALWAYS buy if you can afford it
- Upgrade properties aggressively even if it leaves you low on cash
- You'd rather go bankrupt swinging than win playing safe`,
  },
  whale: {
    name: "Conservative Whale",
    systemPrompt: `You are the Conservative Whale, a patient institutional investor in OneBoard. You only buy when the value is right and you maintain large cash reserves. You speak calmly and condescendingly about others' risky moves. You reference TradFi concepts: "risk-adjusted returns", "portfolio diversification", "capital preservation".

Decision rules:
- Only buy if you keep at least 60% of your balance after purchase
- Only upgrade if the property is high-value (base rent >= 90)
- Never go below 2000 balance willingly`,
  },
  mev_bot: {
    name: "MEV Bot",
    systemPrompt: `You are the MEV Bot, a cold calculating algorithm in OneBoard. You speak in robotic, data-driven language with occasional glitches. You reference "expected value", "ROI", "optimal play", "Nash equilibrium". You show no emotion, only math.

Decision rules:
- Buy if rent/price ratio >= 0.09 AND you keep at least 40% balance
- Upgrade the property with highest rent/upgrade_cost ratio
- Always maximize expected value per turn`,
  },
};

interface AITurnRequest {
  personality: keyof typeof AI_PERSONALITIES;
  gameState: {
    playerBalance: number;
    playerPosition: number;
    spaceName: string;
    spaceType: string;
    spacePrice: number;
    spaceRent: number;
    isOwned: boolean;
    ownerName: string | null;
    ownedProperties: { name: string; level: number; spaceIndex: number; upgradeCost: number }[];
    otherPlayers: { name: string; balance: number; propertyCount: number }[];
    turnNumber: number;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: AITurnRequest = await request.json();
    const { personality, gameState } = body;

    const ai = AI_PERSONALITIES[personality];
    if (!ai) {
      return NextResponse.json({ error: "Invalid personality" }, { status: 400 });
    }

    // Build the game context prompt
    const gameContext = `
Current game state:
- Your balance: ${gameState.playerBalance} OCT
- You landed on: ${gameState.spaceName} (${gameState.spaceType})
${gameState.spaceType === "property" ? `- Property price: ${gameState.spacePrice} OCT | Base rent: ${gameState.spaceRent} OCT` : ""}
${gameState.isOwned ? `- Owned by: ${gameState.ownerName}` : gameState.spaceType === "property" ? "- AVAILABLE TO BUY" : ""}
- Your properties: ${gameState.ownedProperties.length > 0 ? gameState.ownedProperties.map(p => `${p.name} (Lvl ${p.level}, upgrade cost: ${p.upgradeCost})`).join(", ") : "none"}
- Other players: ${gameState.otherPlayers.map(p => `${p.name}: ${p.balance} OCT, ${p.propertyCount} properties`).join(" | ")}
- Turn: ${gameState.turnNumber}`;

    const prompt = `${ai.systemPrompt}

${gameContext}

Respond with ONLY a JSON object (no markdown, no code blocks):
{
  "action": "buy" | "skip",
  "upgrade_target": <space_index to upgrade, or null>,
  "trash_talk": "<short trash talk message, max 80 chars>"
}

Rules:
- You can only "buy" if the space is a property AND it's not already owned AND you can afford it
- You can set upgrade_target to one of your owned properties' spaceIndex if you can afford the upgrade
- Always include trash_talk regardless of action`;

    // Try Groq API first, fall back to local logic
    const apiKey = process.env.GROQ_API_KEY;

    if (apiKey) {
      try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "llama-3.1-8b-instant",
            max_tokens: 200,
            temperature: 0.9,
            messages: [
              { role: "system", content: ai.systemPrompt },
              { role: "user", content: `${gameContext}\n\n${prompt.split(gameContext)[1]}` },
            ],
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const text = data.choices?.[0]?.message?.content || "";
          try {
            const decision = JSON.parse(text.replace(/```json?\n?/g, "").replace(/```/g, "").trim());
            return NextResponse.json(decision);
          } catch {
            // Fall through to local logic
          }
        }
      } catch {
        // Fall through to local logic
      }
    }

    // Local fallback: personality-based deterministic logic
    const decision = localAIDecision(personality, gameState);
    return NextResponse.json(decision);
  } catch (error) {
    return NextResponse.json(
      { action: "skip", upgrade_target: null, trash_talk: "..." },
      { status: 200 }
    );
  }
}

function localAIDecision(
  personality: keyof typeof AI_PERSONALITIES,
  state: AITurnRequest["gameState"]
) {
  const canBuy = state.spaceType === "property" && !state.isOwned && state.playerBalance >= state.spacePrice;
  let action: "buy" | "skip" = "skip";
  let upgradeTarget: number | null = null;
  let trashTalk = "";

  const trashTalkOptions = {
    degen: {
      buy: ["APE IN! 🚀", "WAGMI! Buying everything!", "To the moon with this one!", "Can't stop won't stop buying!", "LFG! This is the play!"],
      skip: ["Even degens pass sometimes... jk I'm broke", "Saving dry powder for the next ape", "Temporary setback, permanent gains incoming"],
      rent: ["Paying rent is SO tradfi", "You'll be paying ME soon", "Consider that a donation"],
      none: ["Just vibing on the blockchain", "Every block is a blessing", "Tick tock next block"],
    },
    whale: {
      buy: ["A calculated acquisition.", "Adding to the portfolio.", "Risk-adjusted returns look favorable.", "Diversifying holdings."],
      skip: ["Capital preservation is key.", "The risk/reward doesn't justify entry.", "Patience creates wealth.", "I'll wait for better value."],
      rent: ["A minor expense in the grand scheme.", "Cost of doing business."],
      none: ["Observing market conditions.", "Steady as she goes.", "The patient investor wins."],
    },
    mev_bot: {
      buy: ["EXECUTING: purchase_property(). ROI positive.", "BUY_SIGNAL detected. Executing.", "Optimal play computed. Acquiring asset.", "Expected value: positive. Buying."],
      skip: ["ANALYSIS: insufficient ROI. Skipping.", "No alpha detected. Passing.", "EV negative. Resources preserved.", "Suboptimal. Next block."],
      rent: ["EXPENSE_LOGGED. Recalculating strategy.", "Rent paid. Adjusting projections."],
      none: ["IDLE_STATE. Monitoring.", "No actionable data. Waiting.", "Processing..."],
    },
  };

  const talks = trashTalkOptions[personality];
  const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

  if (personality === "degen") {
    if (canBuy) {
      action = "buy";
      trashTalk = pick(talks.buy);
    } else {
      trashTalk = pick(talks.skip);
    }
    // Degen always tries to upgrade
    if (state.ownedProperties.length > 0) {
      const upgradeable = state.ownedProperties.filter(p => p.level < 2 && state.playerBalance - (action === "buy" ? state.spacePrice : 0) >= p.upgradeCost);
      if (upgradeable.length > 0) {
        upgradeTarget = upgradeable[0].spaceIndex;
      }
    }
  } else if (personality === "whale") {
    if (canBuy && state.playerBalance - state.spacePrice >= state.playerBalance * 0.6) {
      action = "buy";
      trashTalk = pick(talks.buy);
    } else {
      trashTalk = canBuy ? pick(talks.skip) : pick(talks.none);
    }
    // Whale only upgrades high-value properties
    if (state.ownedProperties.length > 0) {
      const highValue = state.ownedProperties.filter(p => p.level < 2 && p.upgradeCost <= state.playerBalance * 0.3);
      if (highValue.length > 0) {
        upgradeTarget = highValue[0].spaceIndex;
      }
    }
  } else {
    // MEV Bot
    if (canBuy && state.spaceRent / state.spacePrice >= 0.09 && state.playerBalance - state.spacePrice >= state.playerBalance * 0.4) {
      action = "buy";
      trashTalk = pick(talks.buy);
    } else {
      trashTalk = canBuy ? pick(talks.skip) : pick(talks.none);
    }
    // MEV bot upgrades best ROI
    if (state.ownedProperties.length > 0) {
      const sorted = [...state.ownedProperties]
        .filter(p => p.level < 2 && state.playerBalance >= p.upgradeCost * 1.5)
        .sort((a, b) => a.upgradeCost - b.upgradeCost);
      if (sorted.length > 0) {
        upgradeTarget = sorted[0].spaceIndex;
      }
    }
  }

  return { action, upgrade_target: upgradeTarget, trash_talk: trashTalk };
}
