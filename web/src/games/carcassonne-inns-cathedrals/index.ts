import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { CarcassonneInnsCathedralsState, CarcassonneInnsCathedralsAction, CarcassonneInnsCathedralsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CarcassonneInnsCathedralsGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const carcassonneInnsCathedralsPlugin: GamePlugin<CarcassonneInnsCathedralsState, CarcassonneInnsCathedralsAction, typeof settings> = {
  id: "carcassonne-inns-cathedrals",
  title: "Carcassonne: Inns & Cathedrals",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Tile-place expansion: roads, cities, fields, inns, and cathedrals.",
  howToPlay: "Carcassonne: Inns & Cathedrals expands the base tile-laying game with two new feature tiles: inns sit beside roads to double their value, and cathedrals replace city centres to triple completed-city scoring. In this 5x5 adaptation you receive 16 random feature tiles and place them anywhere on the empty board. Click an empty cell to set the next tile from your queue. Tiles score 1 base point plus 1 for each adjacent matching tile. Stacking matching road, city, field, inn, or cathedral tiles together drives strong adjacency chains. The placement order is yours; the queue is fixed at game start. Try to keep tiles of the same type close together to maximise pairs and boost your final score. The game ends after all 16 tiles are placed; final score sums tile bases plus all adjacency bonuses. A score of 30 is solid; 45+ is excellent given that maximum adjacency depends on grouping.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CarcassonneInnsCathedralsSettings),
  reducer,
  isTerminal,
  component: CarcassonneInnsCathedralsGame,
};
