import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { CarcassonneHillsSheepState, CarcassonneHillsSheepAction, CarcassonneHillsSheepSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CarcassonneHillsSheepGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const carcassonneHillsSheepPlugin: GamePlugin<CarcassonneHillsSheepState, CarcassonneHillsSheepAction, typeof settings> = {
  id: "carcassonne-hills-sheep",
  title: "Carcassonne: Hills & Sheep",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Hills, sheep, vineyards, wolves, and barn tile placement.",
  howToPlay: "Carcassonne: Hills & Sheep introduces stacking hill tiles, shepherding mechanics, and wine vineyards. In this 5x5 adaptation you place 15 themed tiles representing hills, sheep, vineyards, wolves, and barns. Click any empty cell to place the next queued tile. Each placement scores 1 base point plus 1 for each orthogonally adjacent same-type tile. Sheep cluster well into flocks, and vineyards score in groups historically — simulated here by adjacency. Wolves are a thematic risk that here simply count as their own type for adjacency. Strategy: identify the upcoming queue and decide whether to extend an existing cluster or start a new one. With five types over 15 tiles you'll see roughly three of each, so two strong clusters is a realistic target. After all 15 placements the game scores final. A respectable score is 25-35; clusterers reach 40+.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CarcassonneHillsSheepSettings),
  reducer,
  isTerminal,
  component: CarcassonneHillsSheepGame,
};
