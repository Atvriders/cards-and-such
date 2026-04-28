import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { NochMalCrossState, NochMalCrossAction, NochMalCrossSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { NochMalCrossGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const nochMalCrossPlugin: GamePlugin<NochMalCrossState, NochMalCrossAction, typeof settings> = {
  id: "noch-mal-cross",
  title: "Noch Mal Cross",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Color/number dice cross-marking; mark cells matching both rolls.",
  howToPlay: `Noch Mal! is a color/number cross-marking roll-and-write. In this adaptation you have a 5x5 grid where each cell has both a color (R/Y/G/B/W) and a number (1-5). Cells are pre-painted in a fixed pattern.

Each turn you roll 2 dice: a color die (R/Y/G/B/W) and a number die (1-5). Click any unmarked cell whose color matches OR whose number matches the rolls; if both match, you score double.

Scoring (at end):
• Each marked cell: +1 base point
• Doubled cells (both color and number matched): +2 bonus on top of base
• Bonus +5 per fully-completed row
• Bonus +5 per fully-completed column
• Bonus +10 per matching color group of 3+ cells (any same-color set of 3+ marked cells)

The game runs 12 rolls. With 12 marks on a 25-cell board, you'll fill about half. Hunt for matching pairs to score doubles. A strong Noch Mal run scores 25-40 points. The fixed pattern rewards memory and aim.`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as NochMalCrossSettings),
  reducer,
  isTerminal,
  component: NochMalCrossGame,
};
