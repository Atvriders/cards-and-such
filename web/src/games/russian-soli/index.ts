import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { RussianSoliState, RussianSoliAction, RussianSoliSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const RussianSoliGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.RussianSoliGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const russianSoliPlugin: GamePlugin<RussianSoliState, RussianSoliAction, typeof settings> = {
  id: "russian-soli",
  title: "Russian Solitaire",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Solitaire micro-variant — Klondike where tableau sequences must be same suit, ignoring color rules.",
  howToPlay: "Russian Solitaire is a ten-round seeded solitaire micro-variant inspired by Klondike where tableau sequences must be same suit, ignoring color rules. Each round you receive a fresh five-card hand drawn from a single seeded deck. You then choose one of three actions: Keep & Score locks the hand and earns variant-flavored points (this version emphasizes same-suit pairs and flushes); Discard Hand abandons it for a flat one-point consolation and rolls into the next round; Swap consumes the next deck card to replace any single card in the hand without ending the round.\n\nScores compound across all ten rounds, with typical totals between forty and one hundred twenty points. The game ends automatically when ten rounds finish or the deck runs out, and the final score is rated Pass, Fair, Good, or Excellent at the standard cutoffs.\n\nRussian Solitaire requires tableau sequences to share suit, transforming Klondike into a much harder game. The micro-variant rewards same-suit cards heavily — flushes pay best. The deal is fully seeded, so the same starting seed always produces an identical card sequence for fair comparison and replay. Practice swap timing — every wasted swap costs you a future round.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as RussianSoliSettings),
  reducer,
  isTerminal,
  hint: (state) => isTerminal(state) ? null : { selector: '[data-testid="play-restart-btn"]', pulses: 3 },
  component: RussianSoliGame,
};
