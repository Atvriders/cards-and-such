import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CasinoState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const Casino = /* @__PURE__ */ lazy(() => import("./Casino.js").then((mod) => ({ default: mod.Casino as unknown as React.ComponentType<unknown> })));
export const casinoSettings = {
  botDifficulty: {
    kind: "enum" as const,
    label: "Bot",
    options: ["easy", "hard"] as const,
    default: "hard" as const,
  },
} as const;

type CasinoSettingsType = SettingsOf<typeof casinoSettings>;

type CasinoAction =
  | { type: "capture"; handCardId: string; tableCardIds: string[] }
  | { type: "build"; handCardId: string; tableCardIds: string[] }
  | { type: "trail"; handCardId: string };

export const casinoPlugin: GamePlugin<CasinoState, CasinoAction, typeof casinoSettings> = {
  id: "casino",
  title: "Casino",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Capture table cards by matching rank or making sums. Scoring favors captured cards, spades, and special cards.",
  howToPlay: `Casino is a fishing-family card game where you capture cards from a central table.

Setup: Each player receives 4 cards; 4 cards are placed face-up on the table. The remaining 40 cards form the stock, dealt 4-at-a-time each round.

On your turn — choose one action: Capture cards from the table by playing a card from your hand that either matches the rank of one or more table cards, or whose value equals the sum of multiple numeric table cards. Face cards (J, Q, K) can only capture by rank match. All captured cards (including your played card) go to your pile. Trail — play a card from your hand face-up onto the table without capturing.

Scoring after all cards are played: Most cards taken: 3 points. Most spades taken: 1 point. 10 of diamonds ("Big Cassino"): 2 points. 2 of spades ("Little Cassino"): 1 point. Each Ace: 1 point (4 total). Each sweep (capturing all table cards): 1 point.

Controls: Click a card in your hand to select it (highlighted in green). Click one or more table cards to select them (highlighted yellow). Click "Capture" if the capture is valid (shown). Click "Trail to Table" to play your selected hand card to the table.`,
  settings: casinoSettings,
  initialState: (seed: number, settings: CasinoSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: CasinoState): HintTarget | null => {
    if (isTerminal(state)) return null;
    return { selector: '[data-testid="hint-target-casino-primary"]', pulses: 3 };
  },
  component: Casino,
};
