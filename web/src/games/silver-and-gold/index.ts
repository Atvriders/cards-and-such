import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { SilverAndGoldState, SilverAndGoldAction, SilverAndGoldSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SilverAndGoldGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const silverAndGoldPlugin: GamePlugin<SilverAndGoldState, SilverAndGoldAction, typeof settings> = {
  id: "silver-and-gold",
  title: "Silver and Gold",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Flip-card polyomino placement on treasure maps.",
  howToPlay: `Silver and Gold is a card-flip polyomino roll-and-write. In this adaptation you flip 12 cards (each shows a polyomino size 1-4) and mark contiguous cells on a 5x5 treasure map.

Each turn click any empty cell to drop a polyomino's anchor there; the cells horizontally and vertically extending fill in based on the size value (1-cell up to 4-cell line). If extension goes off-grid, only what fits is placed.

Scoring at end:
• Each filled cell: +1 base point
• Bonus +5 per fully-completed row
• Bonus +5 per fully-completed column
• Penalty −2 per fully-empty row or column at game end
• Bonus +15 if 20+ cells are filled (treasure-map complete)

The game ends after 12 rolls. With polyomino sizes 1-4, you can fill 12-25 cells depending on your luck.

Strategy: plan to extend polyominoes in directions that complete rows or columns. Avoid placing 4-cell pieces near the edge where they'd waste cells. A strong run scores 25-40 points. The treasure is the bonus.`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SilverAndGoldSettings),
  reducer,
  isTerminal,
  component: SilverAndGoldGame,
};
