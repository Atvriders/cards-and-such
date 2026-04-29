import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { AzulQueensGardenState, AzulQueensGardenAction, AzulQueensGardenSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { AzulQueensGardenGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const azulQueensGardenPlugin: GamePlugin<AzulQueensGardenState, AzulQueensGardenAction, typeof settings> = {
  id: "azul-queens-garden",
  title: "Azul: Queen's Garden",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Garden-tile placement with hedge-row scoring bonuses.",
  howToPlay: "Azul: Queen's Garden replaces stained glass with garden tiles forming hedge rows. In this adaptation you place 15 random garden tiles on a 5x5 grid. Tile types represent five flower colours. Click any empty cell to place the next tile from the queue. Each placement scores 1 base point plus 1 per orthogonally adjacent same-type tile. Strategy: build hedge rows by clustering same-coloured flowers in a line. Long horizontal or vertical chains yield maximum adjacency points. With 15 tiles over five types you average three tiles per colour — enough for two strong cluster bands or one long row. After all placements the game finalises. A typical Queen's Garden score is 24-33 points; an excellent clusterer reaches 40+. Random tile queues guarantee fresh puzzles each game and reward flexible cluster planning.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as AzulQueensGardenSettings),
  reducer,
  isTerminal,
  component: AzulQueensGardenGame,
};
