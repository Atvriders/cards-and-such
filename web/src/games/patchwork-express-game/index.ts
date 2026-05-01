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
  description: "Tile placement: place 12 tiles on a 4x4 grid; score by adjacency.",
  howToPlay: "Patchwork Express is a tile-placement game on a 4x4 grid. A randomized queue of 12 tiles is generated. Each turn the next tile from the queue is shown; click any empty cell to place it. Tile types are: Red, Blue, Yellow. Each orthogonal pair of same-type tiles scores +2. Same-type connected clusters of 3+ score a +4 bonus, clusters of 5+ score an additional +8. Strategy: place tiles next to existing same-type neighbors to grow clusters efficiently. Don't waste placements in isolated corners. The grid has 16 cells but you only place 12 tiles, so plan compact clusters.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as PatchworkExpressGameSettings),
  reducer,
  isTerminal,
  component: PatchworkExpressGameGame,
};
