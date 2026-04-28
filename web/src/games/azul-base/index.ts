import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { AzulBaseState, AzulBaseAction, AzulBaseSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { AzulBaseGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const azulBasePlugin: GamePlugin<AzulBaseState, AzulBaseAction, typeof settings> = {
  id: "azul-base",
  title: "Azul",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Azulejo mosaic tile placement on a 5x5 grid.",
  howToPlay: `Azul is a mosaic-tile drafting game. This adaptation gives you a 5x5 personal wall and 15 random colored tiles. Each tile is one of five colors: blue, yellow, red, black, or white.

Click any empty cell on the wall to place the next tile from the queue.

Scoring (computed at end):
• Each completed row (5 tiles): +2 points
• Each completed column (5 tiles): +7 points
• Each color with 5 tiles on the wall: +10 points
• Each adjacent pair of tiles sharing a color: +1 point
• Penalty −1 for each empty cell on the wall at game end.

With only 15 tiles you cannot fill the entire 25-cell wall, so completion bonuses are tough — a single row plus adjacencies is realistic. Focus on grouping colors to multiply adjacency points and aim for one complete row or column.

Best strategy: pick a color, build a column or row of it, and let the small adjacencies stack. A respectable Azul score is 20-30; an excellent one clears 40.`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as AzulBaseSettings),
  reducer,
  isTerminal,
  component: AzulBaseGame,
};
