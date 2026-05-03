import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SicBoState, SicBoAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const SicBo = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.SicBo as unknown as React.ComponentType<unknown> })));
export const sicBoSettings = {
  startingBankroll: {
    kind: "number" as const,
    label: "Starting Bankroll",
    min: 100,
    max: 5000,
    step: 100,
    default: 1000,
  },
  rollsPerSession: {
    kind: "enum" as const,
    label: "Rolls per Session",
    options: ["10", "25", "50"] as const,
    default: "25",
  },
} as const;

type SicBoSettingsType = SettingsOf<typeof sicBoSettings>;

export const sicBoPlugin: GamePlugin<SicBoState, SicBoAction, typeof sicBoSettings> = {
  id: "sic-bo",
  title: "Sic Bo",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Ancient Chinese dice game. Bet on outcomes of rolling 3 dice. High-risk bets offer huge payouts.",
  howToPlay: `Sic Bo (meaning "precious dice") is an ancient Chinese gambling game played with three dice.

Before each roll, you place chips on the betting board to predict outcomes. Multiple bets are allowed per roll, each costing $10. After rolling, all winning bets pay out and losing bets are collected.

Bet types and payouts:
Small (sum 4–10, no triple): 1:1. Big (sum 11–17, no triple): 1:1. These are the safest bets at roughly 49% win rate.

Any Triple (all three dice the same): 30:1. Specific Triple (e.g., three 4s): 180:1 — the highest payout.

Specific Sum: bet on the exact total. Payouts vary with rarity:
Sum 4 or 17: 60:1 | Sum 5 or 16: 30:1 | Sum 6 or 15: 17:1 | Sum 7 or 14: 12:1 | Sum 8 or 13: 8:1 | Sum 9–12: 6:1.

Specific Single (1–6): bet that a specific number appears on 1, 2, or 3 dice. Pays 1:1, 2:1, or 3:1 based on how many show up.

Specific Double: at least two dice show a chosen value. Pays 10:1.

Strategy: Small and Big offer the best house edge (~2.8%). Specific triples are exciting but carry a 15% house edge. Mix safe bets with a few high-risk bets for excitement.

Settings: Choose starting bankroll and how many rolls per session.`,
  settings: sicBoSettings,
  initialState: (seed: number, settings: SicBoSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state) => {
    const phase = (state as any).phase;
    if (phase === "rolling") return { selector: '[data-testid="hint-target-sic-bo-roll"]', pulses: 3 };
    if (phase === "rolling-dice") return { selector: '[data-testid="hint-target-sic-bo-roll"]', pulses: 3 };
    if (phase === "preRoll") return { selector: '[data-testid="hint-target-sic-bo-roll"]', pulses: 3 };
    if (phase === "ready") return { selector: '[data-testid="hint-target-sic-bo-roll"]', pulses: 3 };
    if (phase === "playerRoll") return { selector: '[data-testid="hint-target-sic-bo-roll"]', pulses: 3 };
    if (phase === "roll") return { selector: '[data-testid="hint-target-sic-bo-roll"]', pulses: 3 };
    if (phase === "play") return { selector: '[data-testid="hint-target-sic-bo-roll"]', pulses: 3 };
    if (phase === "playing") return { selector: '[data-testid="hint-target-sic-bo-roll"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-sic-bo-roll"]', pulses: 3 };
  },
  component: SicBo,
};
