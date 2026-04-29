import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { AgnesBernauerState, AgnesBernauerAction, AgnesBernauerSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { AgnesBernauerGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const agnesBernauerPlugin: GamePlugin<AgnesBernauerState, AgnesBernauerAction, typeof settings> = {
  id: "agnes-bernauer",
  title: "Agnes Bernauer",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Solitaire micro-variant — Klondike variant where the foundation base card comes from the seven-card reserve.",
  howToPlay: "Agnes Bernauer is a ten-round seeded solitaire micro-variant inspired by Klondike variant where the foundation base card comes from the seven-card reserve. Each round you receive a fresh five-card hand drawn from a single seeded deck. You then choose one of three actions: Keep & Score locks the hand and earns variant-flavored points (this version emphasizes reserve-influenced runs); Discard Hand abandons it for a flat one-point consolation and rolls into the next round; Swap consumes the next deck card to replace any single card in the hand without ending the round.\n\nScores compound across all ten rounds, with typical totals between forty and one hundred twenty points. The game ends automatically when ten rounds finish or the deck runs out, and the final score is rated Pass, Fair, Good, or Excellent at the standard cutoffs.\n\nAgnes Bernauer features a seven-card reserve and dynamic foundation base. The micro-variant rewards strong runs from a fresh hand — exactly the prize you would chase in the parent game. The deal is fully seeded, so the same starting seed always produces an identical card sequence for fair comparison and replay. Practice swap timing — every wasted swap costs you a future round.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as AgnesBernauerSettings),
  reducer,
  isTerminal,
  component: AgnesBernauerGame,
};
