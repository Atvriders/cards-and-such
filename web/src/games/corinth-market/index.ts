import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { CorinthMarketState, CorinthMarketAction, CorinthMarketSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CorinthMarketGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const corinthMarketPlugin: GamePlugin<CorinthMarketState, CorinthMarketAction, typeof settings> = {
  id: "corinth-market",
  title: "Corinth Market",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Draft dice from columns to score goods on a 4x4 market sheet.",
  howToPlay: `Corinth is an Ancient Greek market roll-and-write. In this adaptation you roll 4 dice each turn into 4 columns (one die per column). Click any column to claim its die's value, then mark a cell in the corresponding row of your 4x4 sheet.

Each row is one good: pottery (row 1), wine (row 2), olives (row 3), wool (row 4). Within a row, cells must be marked in order from left to right.

Scoring (at end):
• Pottery row: +2 per cell marked, +5 bonus if row complete
• Wine row: +1 per cell marked × cell index (1, 2, 3, 4) so the 4th cell is worth 4
• Olives row: +3 per cell, but only if the cell index ≤ the die value when marked
• Wool row: +1 per cell, +1 per matching pair across columns of other rows

The game runs 10 rolls. Allocate dice to maximize each row's strengths. Wine wants late-row cells; olives want low-die-value cells; pottery is steady; wool is bonus.

A strong Corinth Market scores 25-40 points. Diversify rows to maximize set bonuses.`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CorinthMarketSettings),
  reducer,
  isTerminal,
  component: CorinthMarketGame,
};
