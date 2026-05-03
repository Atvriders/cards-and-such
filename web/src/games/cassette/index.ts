import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { CassetteState, CassetteAction, CassetteSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const CassetteGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.CassetteGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const cassettePlugin: GamePlugin<CassetteState, CassetteAction, typeof settings> = {
  id: "cassette",
  title: "Cassette (Agnes Bernauer)",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Solitaire micro-variant — Klondike-family game with a reserve row and alternative foundation start.",
  howToPlay: "Cassette (Agnes Bernauer) is a ten-round seeded solitaire micro-variant inspired by Klondike-family game with a reserve row and alternative foundation start. Each round you receive a fresh five-card hand drawn from a single seeded deck. You then choose one of three actions: Keep & Score locks the hand and earns variant-flavored points (this version emphasizes reserve-style pairs and runs); Discard Hand abandons it for a flat one-point consolation and rolls into the next round; Swap consumes the next deck card to replace any single card in the hand without ending the round.\n\nScores compound across all ten rounds, with typical totals between forty and one hundred twenty points. The game ends automatically when ten rounds finish or the deck runs out, and the final score is rated Pass, Fair, Good, or Excellent at the standard cutoffs.\n\nCassette (named after Agnes Bernauer) places a reserve row across the top and starts foundations from the next dealt rank. This micro-variant honors the reserve mechanic with a hand-and-pull format. The deal is fully seeded, so the same starting seed always produces an identical card sequence for fair comparison and replay. Practice swap timing — every wasted swap costs you a future round.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CassetteSettings),
  reducer,
  isTerminal,
  hint: (state) => isTerminal(state) ? null : { selector: '[data-testid="play-restart-btn"]', pulses: 3 },
  component: CassetteGame,
};
