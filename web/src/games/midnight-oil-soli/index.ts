import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { MidnightOilSoliState, MidnightOilSoliAction, MidnightOilSoliSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const MidnightOilSoliGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.MidnightOilSoliGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const midnightOilSoliPlugin: GamePlugin<MidnightOilSoliState, MidnightOilSoliAction, typeof settings> = {
  id: "midnight-oil-soli",
  title: "Midnight Oil",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Solitaire micro-variant — La Belle Lucie variant with flexible fan sizes for late-night solving.",
  howToPlay: "Midnight Oil is a ten-round seeded solitaire micro-variant inspired by La Belle Lucie variant with flexible fan sizes for late-night solving. Each round you receive a fresh five-card hand drawn from a single seeded deck. You then choose one of three actions: Keep & Score locks the hand and earns variant-flavored points (this version emphasizes long runs and flushes); Discard Hand abandons it for a flat one-point consolation and rolls into the next round; Swap consumes the next deck card to replace any single card in the hand without ending the round.\n\nScores compound across all ten rounds, with typical totals between forty and one hundred twenty points. The game ends automatically when ten rounds finish or the deck runs out, and the final score is rated Pass, Fair, Good, or Excellent at the standard cutoffs.\n\nMidnight Oil burns the midnight hour with flexible fan sizes — endless tweaking but more wins. The micro-variant rewards both long runs and flushes — work for them. The deal is fully seeded, so the same starting seed always produces an identical card sequence for fair comparison and replay. Practice swap timing — every wasted swap costs you a future round.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as MidnightOilSoliSettings),
  reducer,
  isTerminal,
  hint: (state) => isTerminal(state) ? null : { selector: '[data-testid="play-restart-btn"]', pulses: 3 },
  component: MidnightOilSoliGame,
};
