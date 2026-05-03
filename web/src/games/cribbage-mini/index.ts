import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf , HintTarget } from "../../platform/game-plugin/types.js";
import type { CribbageMiniState, CribbageMiniAction, CribbageMiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const CribbageMiniGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.CribbageMiniGame as unknown as React.ComponentType<unknown> })));
const settings = {
  dummy: { kind: "boolean" as const, label: "dummy", default: false },
} as const;

type S = SettingsOf<typeof settings>;

export const cribbageMiniPlugin: GamePlugin<CribbageMiniState, CribbageMiniAction, typeof settings> = {
  id: "cribbage-mini",
  title: "Cribbage Mini",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Cribbage stripped to a 4-card deal and a sprint to 31 points: keep 2, discard 2 to the crib, cut a starter, score combos.",
  howToPlay: `Cribbage Mini is a compact head-to-head cribbage. The game is a sprint to 31 points (a "short street").

Each hand:
1) You and the bot are each dealt 4 cards. Pick 2 to discard to the crib (4-card extra hand owned by the dealer that turn).
2) A starter card is cut from the rest of the deck.
3) Each side scores their 2-card hand + starter for combos: fifteens (any subset summing to 15) = 2pts each; pairs = 2pts; run of 3 (consecutive ranks) = 3pts; flush of 3 (all same suit) = 3pts.
4) The crib (your two discards + the bot's two + starter) is scored for whoever was dealer this hand.

Card values: A=1, 2..9=face, 10/J/Q/K=10. Ranks for runs/pairs use face order.

Click cards in your hand to mark them for discard (you must mark exactly 2). Then click Submit. Review the show, then click Next deal. Dealer alternates each hand. First to 31 pts wins.

Scoring: win = 100 + your final score; loss = your final score.

Tips: keep card pairs and pairs that sum to 15. The starter is unknown, so prefer flexibility (5s are excellent — they pair with 10/J/Q/K for 15s).`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CribbageMiniSettings),
  reducer,
  isTerminal,
  hint: (state: CribbageMiniState): HintTarget | null => {
    if (isTerminal(state)) return null;
    return { selector: '[data-testid="hint-target-cribbage-mini-next"]', pulses: 3 };
  },
  component: CribbageMiniGame,
};
