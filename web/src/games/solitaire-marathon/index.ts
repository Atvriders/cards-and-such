import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SolitaireMarathonState, SolitaireMarathonAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const SolitaireMarathon = /* @__PURE__ */ lazy(() => import("./SolitaireMarathon.js").then((mod) => ({ default: mod.SolitaireMarathon as unknown as React.ComponentType<unknown> })));
export const solitaireMarathonSettings = {
  rounds: {
    kind: "enum" as const,
    label: "Rounds",
    options: ["3", "5", "7"] as const,
    default: "5",
  },
} as const;

type SolitaireMarathonSettingsType = SettingsOf<typeof solitaireMarathonSettings>;

export const solitaireMarathonPlugin: GamePlugin<SolitaireMarathonState, SolitaireMarathonAction, typeof solitaireMarathonSettings> = {
  id: "solitaire-marathon",
  title: "Marathon Solitaire",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Draw through a full deck and collect matching pairs off the top of the pile.",
  howToPlay: `Marathon Solitaire is a calm, single-player card patience game played over multiple rounds. Each round a full 52-card deck is shuffled and placed face-down. Click the deck to draw cards one at a time onto a face-up pile.

After each draw, look at the top two cards of the pile. If they share the same suit or the same rank, you may click Collect Pair to remove them and score two points. Keep drawing and collecting until the deck is exhausted.

The goal is to maximise the number of cards collected before the deck runs out. Not all pairs can be captured — you must time your collections carefully. Collecting too early may bury a better opportunity; waiting too long means the pair gets covered.

Rounds: choose 3, 5, or 7 rounds. Each round uses a fresh shuffled deck. Your total collected cards across all rounds determines your score, normalised to 100.

Strategy tip: a same-rank pair (e.g., two Kings) is often worth collecting immediately, since same-rank cards are rarer on adjacent positions than same-suit cards. Same-suit pairs occur naturally more often if the deck isn't deliberately alternating, so stay patient.`,
  settings: solitaireMarathonSettings,
  initialState: (seed: number, settings: SolitaireMarathonSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state) => isTerminal(state) ? null : { selector: '[data-testid="play-restart-btn"]', pulses: 3 },
  component: SolitaireMarathon,
};
