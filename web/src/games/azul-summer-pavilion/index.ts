import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { AzulSummerPavilionState, AzulSummerPavilionAction, AzulSummerPavilionSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { AzulSummerPavilionGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const azulSummerPavilionPlugin: GamePlugin<AzulSummerPavilionState, AzulSummerPavilionAction, typeof settings> = {
  id: "azul-summer-pavilion",
  title: "Azul: Summer Pavilion",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Star-pattern Azul variant on a 6x6 grid.",
  howToPlay: `Azul: Summer Pavilion uses a star-shaped board where each color rotates as the wild each round. In this adaptation, you place 18 random colored tiles on a 6x6 grid (six colors instead of five: blue, yellow, red, black, white, gold).

Click any empty cell to place the next tile from the queue.

Scoring (at end):
• Each tile placed adjacent (orthogonally) to a tile of the same color: +2 points
• Each tile placed adjacent to a tile of any different color: +1 point
• Each fully-filled row (6 cells): +5 points
• Each fully-filled column (6 cells): +5 points
• Bonus +8 per color that has 3+ tiles placed.

This variant rewards both clustering AND mixing. Place same-colors next to each other for big adjacency, but spread enough to qualify for the 3+ color bonus across as many colors as possible.

A strong Summer Pavilion run scores 45-65 points. With 18 tiles on 36 cells you'll cover half the board, so prioritize a single completed row for the bonus and color clusters elsewhere.`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as AzulSummerPavilionSettings),
  reducer,
  isTerminal,
  component: AzulSummerPavilionGame,
};
