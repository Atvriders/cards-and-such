import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { BlokusState, BlokusAction, BlokusSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BlokusGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const blokusPlugin: GamePlugin<BlokusState, BlokusAction, typeof settings> = {
  id: "blokus",
  title: "Blokus",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Tile placement: place 20 tiles on a 6x6 grid; score by adjacency.",
  howToPlay: "Blokus is a tile-placement game on a 6x6 grid. A randomized queue of 20 tiles is generated. Each turn the next tile from the queue is shown; click any empty cell to place it. Tile types are: Red, Blue, Yellow, Green. Each orthogonal pair of same-type tiles scores +2. Same-type connected clusters of 3+ score a +4 bonus, clusters of 5+ score an additional +8. Strategy: place tiles next to existing same-type neighbors to grow clusters efficiently. Don't waste placements in isolated corners. The grid has 36 cells but you only place 20 tiles, so plan compact clusters.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as BlokusSettings),
  reducer,
  isTerminal,
  component: BlokusGame,
};
