import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { PatchworkDoodleQuiltState, PatchworkDoodleQuiltAction, PatchworkDoodleQuiltSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PatchworkDoodleQuiltGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const patchworkDoodleQuiltPlugin: GamePlugin<PatchworkDoodleQuiltState, PatchworkDoodleQuiltAction, typeof settings> = {
  id: "patchwork-doodle-quilt",
  title: "Patchwork Doodle",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Roll-and-write Patchwork variant; draw polyomino patches on a personal quilt.",
  howToPlay: "Patchwork Doodle is the roll-and-write spin-off of Patchwork where players draw polyomino patches on a personal grid. In this adaptation you place 14 random patch tiles on a 5x5 quilt. Tile types represent five polyomino patterns. Click any empty cell to place the next tile from the queue. Each placement scores 1 base point plus 1 per orthogonally adjacent same-pattern tile. Strategy: cluster matching patches into adjoining rows or columns. With 14 tiles over five patterns you'll average 2-3 of each, so two well-built clusters can dominate scoring. The 5x5 grid leaves 11 empty cells for placement freedom. After all placements the game finalises with adjacency bonuses. A respectable score is 24-32 points; clusterers reach 38+. Each random queue makes every doodle session a unique quilt-design puzzle.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as PatchworkDoodleQuiltSettings),
  reducer,
  isTerminal,
  component: PatchworkDoodleQuiltGame,
};
