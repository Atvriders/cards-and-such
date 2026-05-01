import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { AzulSintraState, AzulSintraAction, AzulSintraSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { AzulSintraGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const azulSintraPlugin: GamePlugin<AzulSintraState, AzulSintraAction, typeof settings> = {
  id: "azul-sintra",
  title: "Azul: Sintra",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Tile placement: place 15 tiles on a 5x5 grid; score by adjacency.",
  howToPlay: "Azul: Sintra is a tile-placement game on a 5x5 grid. A randomized queue of 15 tiles is generated. Each turn the next tile from the queue is shown; click any empty cell to place it. Tile types are: Cyan, Lemon, Coral, Charcoal, Jade. Each orthogonal pair of same-type tiles scores +2. Same-type connected clusters of 3+ score a +4 bonus, clusters of 5+ score an additional +8. Strategy: place tiles next to existing same-type neighbors to grow clusters efficiently. Don't waste placements in isolated corners. The grid has 25 cells but you only place 15 tiles, so plan compact clusters.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as AzulSintraSettings),
  reducer,
  isTerminal,
  component: AzulSintraGame,
};
