import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { ScorpionSoliState, ScorpionSoliAction, ScorpionSoliSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const ScorpionSoliGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.ScorpionSoliGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const scorpionSoliPlugin: GamePlugin<ScorpionSoliState, ScorpionSoliAction, typeof settings> = {
  id: "scorpion-soli",
  title: "Scorpion",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Solitaire micro-variant — Spider-cousin with three reserve cards and seven tableau columns built by suit.",
  howToPlay: "Scorpion is a ten-round seeded solitaire micro-variant inspired by Spider-cousin with three reserve cards and seven tableau columns built by suit. Each round you receive a fresh five-card hand drawn from a single seeded deck. You then choose one of three actions: Keep & Score locks the hand and earns variant-flavored points (this version emphasizes long suited runs); Discard Hand abandons it for a flat one-point consolation and rolls into the next round; Swap consumes the next deck card to replace any single card in the hand without ending the round.\n\nScores compound across all ten rounds, with typical totals between forty and one hundred twenty points. The game ends automatically when ten rounds finish or the deck runs out, and the final score is rated Pass, Fair, Good, or Excellent at the standard cutoffs.\n\nScorpion stings: build seven columns down by suit with only three reserve cards to help. The micro-variant rewards long suited runs in the hand. The deal is fully seeded, so the same starting seed always produces an identical card sequence for fair comparison and replay. Practice swap timing — every wasted swap costs you a future round.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ScorpionSoliSettings),
  hint: (state: ScorpionSoliState): HintTarget | null => {
    if (state.phase === "done") return null;
    return { selector: `[data-testid="hint-target-scorpion-soli-keep"]`, pulses: 3 };
  },
  reducer,
  isTerminal,
  component: ScorpionSoliGame,
};
