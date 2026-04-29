import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { AllInRowState, AllInRowAction, AllInRowSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { AllInRowGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const allInRowPlugin: GamePlugin<AllInRowState, AllInRowAction, typeof settings> = {
  id: "all-in-row",
  title: "All in a Row",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Solitaire micro-variant — Long single-row Golf variant with a one-card stock draw at a time.",
  howToPlay: "All in a Row is a ten-round seeded solitaire micro-variant inspired by Long single-row Golf variant with a one-card stock draw at a time. Each round you receive a fresh five-card hand drawn from a single seeded deck. You then choose one of three actions: Keep & Score locks the hand and earns variant-flavored points (this version emphasizes long ascending runs); Discard Hand abandons it for a flat one-point consolation and rolls into the next round; Swap consumes the next deck card to replace any single card in the hand without ending the round.\n\nScores compound across all ten rounds, with typical totals between forty and one hundred twenty points. The game ends automatically when ten rounds finish or the deck runs out, and the final score is rated Pass, Fair, Good, or Excellent at the standard cutoffs.\n\nAll in a Row is Golf stretched into a single line. The micro-variant rewards long ascending runs — keep the slope rising and the points climb. The deal is fully seeded, so the same starting seed always produces an identical card sequence for fair comparison and replay. Practice swap timing — every wasted swap costs you a future round.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as AllInRowSettings),
  reducer,
  isTerminal,
  component: AllInRowGame,
};
