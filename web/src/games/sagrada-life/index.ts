import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { SagradaLifeState, SagradaLifeAction, SagradaLifeSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SagradaLifeGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const sagradaLifePlugin: GamePlugin<SagradaLifeState, SagradaLifeAction, typeof settings> = {
  id: "sagrada-life",
  title: "Sagrada: Life",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Sagrada window with new patterns and life-themed objectives.",
  howToPlay: "Sagrada: Life expands Sagrada with new window patterns and private objectives. In this adaptation you place 16 random coloured-dice tiles on a 5x5 personal window. Tile types represent six colours including teal. Click any empty cell to place the next tile from the queue. Each placement scores 1 base point plus 1 for each orthogonally adjacent same-colour tile. Classic Sagrada bans adjacent same colours, but in this scoring abstraction we reward the opposite — clustering same colours for an adjacency-density bonus. With six types over 16 tiles you'll see roughly 2-3 of each, so the puzzle is to position your matches efficiently across multiple small clusters. After all placements the game finalises. A respectable score is 25-32 points; clever clusterers reach 38+. Random queues guarantee no two windows are alike, keeping every Sagrada: Life session fresh.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SagradaLifeSettings),
  reducer,
  isTerminal,
  component: SagradaLifeGame,
};
