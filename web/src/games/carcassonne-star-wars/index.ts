import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { CarcassonneStarWarsState, CarcassonneStarWarsAction, CarcassonneStarWarsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CarcassonneStarWarsGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const carcassonneStarWarsPlugin: GamePlugin<CarcassonneStarWarsState, CarcassonneStarWarsAction, typeof settings> = {
  id: "carcassonne-star-wars",
  title: "Carcassonne: Star Wars",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Tile placement: place 18 tiles on a 6x6 grid; score by adjacency.",
  howToPlay: "Carcassonne: Star Wars is a tile-placement game on a 6x6 grid. A randomized queue of 18 tiles is generated. Each turn the next tile from the queue is shown; click any empty cell to place it. Tile types are: Rebels, Empire, Planet, Asteroid, Ship. Each orthogonal pair of same-type tiles scores +2. Same-type connected clusters of 3+ score a +4 bonus, clusters of 5+ score an additional +8. Strategy: place tiles next to existing same-type neighbors to grow clusters efficiently. Don't waste placements in isolated corners. The grid has 36 cells but you only place 18 tiles, so plan compact clusters.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CarcassonneStarWarsSettings),
  reducer,
  isTerminal,
  component: CarcassonneStarWarsGame,
};
