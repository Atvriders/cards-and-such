import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { Nmbr9StackState, Nmbr9StackAction, Nmbr9StackSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Nmbr9StackGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const nmbr9StackPlugin: GamePlugin<Nmbr9StackState, Nmbr9StackAction, typeof settings> = {
  id: "nmbr9-stack",
  title: "NMBR9 Stack",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Number tile stacking; higher tier scores more.",
  howToPlay: `NMBR9 is a number-tile stacking puzzle. In this adaptation you place 12 number tiles (digits 0-9, randomly drawn) on a 5x5 grid. Each placement is on layer 1 by default, but if a tile is placed on a cell adjacent to another tile already placed, it counts as layer 2 (worth more).

Click any empty cell to place the next tile.

Scoring at end:
• Each tile scores its digit-value × layer (where layer = 1 if isolated; layer = 2 if it has 1 neighbor; layer = 3 if it has 2+ neighbors).
• Layer 1 zeros score 0; layer 3 nines score 27.
• Bonus +10 if you place 3+ tiles with digit ≥ 7.

The goal is to move tiles upward in tiers by clustering. A 9 in isolation scores 9 (layer 1). The same 9 with 2+ neighbors scores 27. Save your high digits for crowded areas.

A great NMBR9 stack scores 80-110. Always prefer placing high numbers next to existing tiles. Low numbers can fill gaps to enable layer-3 placements for upcoming tiles.`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as Nmbr9StackSettings),
  reducer,
  isTerminal,
  component: Nmbr9StackGame,
};
