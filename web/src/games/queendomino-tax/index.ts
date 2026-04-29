import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { QueendominoTaxState, QueendominoTaxAction, QueendominoTaxSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { QueendominoTaxGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const queendominoTaxPlugin: GamePlugin<QueendominoTaxState, QueendominoTaxAction, typeof settings> = {
  id: "queendomino-tax",
  title: "Queendomino: Tax & Towers",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Tax-collecting Queendomino landscape with tower defence rules.",
  howToPlay: "Queendomino expands Kingdomino with buildings, tax collectors, and towers that influence neighbouring territories. In this adaptation you place 14 random landscape tiles on a 5x5 grid representing five terrain types: water, forest, grain, mountain, and tower. Click any empty cell to place the next tile from your queue. Each placement scores 1 base point plus 1 per orthogonally adjacent same-type tile. Tower tiles thematically dominate adjacent kingdoms, and towers clustered together here earn the most adjacency bonus. Plan placements to extend existing terrain clusters. After 14 placements the game finalises with all adjacencies summed. A typical Queendomino-style score lands at 25-32 points; an exceptional clusterer can reach 38+. Each game is unique because the queue is randomised. Strategy emphasises long-term clustering rather than one-tile placements.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as QueendominoTaxSettings),
  reducer,
  isTerminal,
  component: QueendominoTaxGame,
};
