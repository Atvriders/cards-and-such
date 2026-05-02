import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { SultanSoliState, SultanSoliAction, SultanSoliSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SultanSoliGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const sultanSoliPlugin: GamePlugin<SultanSoliState, SultanSoliAction, typeof settings> = {
  id: "sultan-soli",
  title: "Sultan",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Solitaire micro-variant — Two-deck patience built around the King of Hearts as central court.",
  howToPlay: "Sultan is a ten-round seeded solitaire micro-variant inspired by Two-deck patience built around the King of Hearts as central court. Each round you receive a fresh five-card hand drawn from a single seeded deck. You then choose one of three actions: Keep & Score locks the hand and earns variant-flavored points (this version emphasizes court-card hands); Discard Hand abandons it for a flat one-point consolation and rolls into the next round; Swap consumes the next deck card to replace any single card in the hand without ending the round.\n\nScores compound across all ten rounds, with typical totals between forty and one hundred twenty points. The game ends automatically when ten rounds finish or the deck runs out, and the final score is rated Pass, Fair, Good, or Excellent at the standard cutoffs.\n\nSultan places the King of Hearts in the center and builds eight kings around him. The micro-variant prizes court cards — every face card in your hand pays. The deal is fully seeded, so the same starting seed always produces an identical card sequence for fair comparison and replay. Practice swap timing — every wasted swap costs you a future round.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SultanSoliSettings),
  hint: (state: SultanSoliState): HintTarget | null => {
    if (state.phase === "done") return null;
    return { selector: `[data-testid="hint-target-sultan-soli-keep"]`, pulses: 3 };
  },
  reducer,
  isTerminal,
  component: SultanSoliGame,
};
