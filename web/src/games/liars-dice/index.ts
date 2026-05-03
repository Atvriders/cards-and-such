import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { LiarsDiceState, LiarsDiceAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const LiarsDice = /* @__PURE__ */ lazy(() => import("./LiarsDice.js").then((mod) => ({ default: mod.LiarsDice as unknown as React.ComponentType<unknown> })));
export const liarsDiceSettings = {
  startingDice: {
    kind: "enum" as const,
    label: "Starting dice",
    options: ["3", "4", "5"] as const,
    default: "5" as const,
  },
  botAggressiveness: {
    kind: "enum" as const,
    label: "Bot",
    options: ["cautious", "balanced", "aggressive"] as const,
    default: "balanced" as const,
  },
} as const;

type LiarsDiceSettingsType = SettingsOf<typeof liarsDiceSettings>;

export const liarsDicePlugin: GamePlugin<LiarsDiceState, LiarsDiceAction, typeof liarsDiceSettings> = {
  id: "liars-dice",
  title: "Liar's Dice",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Bid on how many dice show a given face across all players. Call the bluff when you don't believe it.",
  howToPlay: `Out-bluff the bot by making bids about hidden dice and catching lies before you run out of dice.

At the start of each round both players roll their dice in secret. On your turn you must either make a higher bid than the previous one or call "Liar!" A bid is a claim that at least N dice showing face F exist across all players' dice combined. A higher bid means a larger quantity of any face, or the same quantity of a higher face. When someone calls "Liar!" all dice are revealed. If the actual count of the claimed face meets or exceeds the bid, the bidder wins the challenge; otherwise the caller wins. The loser removes one die. A player with no dice left loses.

Score on winning is 100 + remainingDice × 50. Settings let you choose starting dice per player (3, 4, or 5) and the bot's aggressiveness (cautious, balanced, or aggressive).

Tips: Your bid should reflect what you know about your own dice plus a probabilistic guess about the bot's. On average each face appears on about one-sixth of all dice in play. Call bluffs when the claimed count significantly exceeds what the total dice count makes likely.`,
  settings: liarsDiceSettings,
  initialState: (seed: number, settings: LiarsDiceSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: LiarsDiceState): HintTarget | null => {
    if (state.winner !== null) return null;
    if (state.turn !== 0) return null;
    const bid = state.currentBid;
    if (!bid) {
      return { selector: '[data-testid="hint-target-liars-dice-bid"]', pulses: 3 };
    }
    // Estimate probability: actual count of bid.face across known + expected on bot's side
    const known = state.playerDice.filter((d) => d === bid.face).length;
    const expected = known + state.botDice.length / 6;
    // If bid significantly exceeds expectation, suggest Call; otherwise Bid (raise)
    if (bid.count > expected * 1.4) {
      return { selector: '[data-testid="hint-target-liars-dice-call"]', pulses: 3 };
    }
    return { selector: '[data-testid="hint-target-liars-dice-bid"]', pulses: 3 };
  },
  component: LiarsDice,
  themeOverrides: {
    feltGradient: "linear-gradient(135deg, #6b3f1a, #8a5a2b 50%, #4a2810)",
    accent: "rgba(217, 119, 6, 0.45)",
  },
};
