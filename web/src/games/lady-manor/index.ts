import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { LadyManorState, LadyManorAction, LadyManorSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { LadyManorGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const ladyManorPlugin: GamePlugin<LadyManorState, LadyManorAction, typeof settings> = {
  id: "lady-manor",
  title: "Lady of the Manor",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Solitaire micro-variant — Sir Tommy variant with six waste piles instead of four — more freedom of placement.",
  howToPlay: "Lady of the Manor is a ten-round seeded solitaire micro-variant inspired by Sir Tommy variant with six waste piles instead of four — more freedom of placement. Each round you receive a fresh five-card hand drawn from a single seeded deck. You then choose one of three actions: Keep & Score locks the hand and earns variant-flavored points (this version emphasizes ranked stacking bonus); Discard Hand abandons it for a flat one-point consolation and rolls into the next round; Swap consumes the next deck card to replace any single card in the hand without ending the round.\n\nScores compound across all ten rounds, with typical totals between forty and one hundred twenty points. The game ends automatically when ten rounds finish or the deck runs out, and the final score is rated Pass, Fair, Good, or Excellent at the standard cutoffs.\n\nLady of the Manor expands Sir Tommy from four waste piles to six, giving you more ways to sort. The micro-variant rewards rank-stacking — pairs and triples, not flushes. The deal is fully seeded, so the same starting seed always produces an identical card sequence for fair comparison and replay. Practice swap timing — every wasted swap costs you a future round.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as LadyManorSettings),
  reducer,
  isTerminal,
  hint: (state) => isTerminal(state) ? null : { selector: '[data-testid="play-restart-btn"]', pulses: 3 },
  component: LadyManorGame,
};
