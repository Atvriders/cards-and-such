import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { DeucesSoliState, DeucesSoliAction, DeucesSoliSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DeucesSoliGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const deucesSoliPlugin: GamePlugin<DeucesSoliState, DeucesSoliAction, typeof settings> = {
  id: "deuces-soli",
  title: "Deuces",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Solitaire micro-variant — Two-deck game where all 2s seed the foundations and you build up to aces.",
  howToPlay: "Deuces is a ten-round seeded solitaire micro-variant inspired by Two-deck game where all 2s seed the foundations and you build up to aces. Each round you receive a fresh five-card hand drawn from a single seeded deck. You then choose one of three actions: Keep & Score locks the hand and earns variant-flavored points (this version emphasizes low-rank starts); Discard Hand abandons it for a flat one-point consolation and rolls into the next round; Swap consumes the next deck card to replace any single card in the hand without ending the round.\n\nScores compound across all ten rounds, with typical totals between forty and one hundred twenty points. The game ends automatically when ten rounds finish or the deck runs out, and the final score is rated Pass, Fair, Good, or Excellent at the standard cutoffs.\n\nDeuces seeds foundations with 2s and builds upward through the ranks ending at aces. The micro-variant rewards low ranks and ascending runs — start small, climb fast. The deal is fully seeded, so the same starting seed always produces an identical card sequence for fair comparison and replay. Practice swap timing — every wasted swap costs you a future round.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as DeucesSoliSettings),
  reducer,
  isTerminal,
  component: DeucesSoliGame,
};
