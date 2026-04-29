import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { CarcassonneTowerBuildState, CarcassonneTowerBuildAction, CarcassonneTowerBuildSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CarcassonneTowerBuildGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const carcassonneTowerBuildPlugin: GamePlugin<CarcassonneTowerBuildState, CarcassonneTowerBuildAction, typeof settings> = {
  id: "carcassonne-tower-build",
  title: "Carcassonne: The Tower",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Carcassonne tower expansion: towers, cities, knights, roads, fields.",
  howToPlay: "Carcassonne: The Tower introduces tower components that capture opponents' meeples. In this solo adaptation you place 16 tile types representing towers, cities, knights, roads, and fields. Click any empty cell on the 5x5 board to place the next tile from the queue. Each tile scores 1 base point plus 1 for each orthogonally adjacent tile sharing the same type. Towers are particularly valuable when grouped because clustered towers form strongholds; in your scoring sheet that means stacking towers next to each other yields rapid adjacency points. Knights and cities also pair well by their feudal connection. Plan placements so the upcoming queue tile is most likely to match the cluster you started. Final scoring runs after all 16 placements and includes every adjacency. A respectable score is 28-38; an excellent strategist who clusters two big groups can exceed 45 points.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CarcassonneTowerBuildSettings),
  reducer,
  isTerminal,
  component: CarcassonneTowerBuildGame,
};
