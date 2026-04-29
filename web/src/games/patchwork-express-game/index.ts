import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { PatchworkExpressGameState, PatchworkExpressGameAction, PatchworkExpressGameSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PatchworkExpressGameGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const patchworkExpressGamePlugin: GamePlugin<PatchworkExpressGameState, PatchworkExpressGameAction, typeof settings> = {
  id: "patchwork-express-game",
  title: "Patchwork Express",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Simplified Patchwork tile quilt for younger or quick players.",
  howToPlay: "Patchwork Express is a streamlined Patchwork edition with a smaller board and simpler shapes. In this adaptation you place 10 random patch tiles on a 4x4 quilt grid. Tile types are four fabric patterns. Click any empty cell to place the next queued tile. Each placement scores 1 base point plus 1 for each orthogonally adjacent same-pattern tile. With only 10 placements on 16 cells you cannot fill the quilt entirely — focus on clustering the patterns you draw. A 4x4 grid is tight, so tile choice and position matter heavily. Strategy: keep matching fabric tiles touching to maximise adjacency points. After 10 placements the game finalises. A solid Express score is 16-22 points; an excellent clusterer can reach 28+. Random queues ensure each quick quilt session is fresh and beatable in only a few minutes.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as PatchworkExpressGameSettings),
  reducer,
  isTerminal,
  component: PatchworkExpressGameGame,
};
