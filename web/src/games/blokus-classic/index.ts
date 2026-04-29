import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { BlokusClassicState, BlokusClassicAction, BlokusClassicSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BlokusClassicGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const blokusClassicPlugin: GamePlugin<BlokusClassicState, BlokusClassicAction, typeof settings> = {
  id: "blokus-classic",
  title: "Blokus Classic",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Polyomino corner-touch placement on a personal Blokus grid.",
  howToPlay: "Blokus is a polyomino-placement game where same-colour pieces must touch only at corners. In this adaptation you place 13 colour tiles on a 5x5 personal grid. Tile types are four classic Blokus colours: blue, green, red, yellow. Click any empty cell to place the next tile from the queue. Each placement scores 1 base point plus 1 per orthogonally adjacent same-colour tile (the inverse of classic Blokus's corner-only rule, here rewarding clustering for solo scoring purposes). Strategy: build colour zones with same-colour tiles touching for bonus points. With four types over 13 tiles you'll average 3-4 of each, allowing two strong clusters. After all placements the game finalises. A typical Blokus Classic adaptation score is 22-30 points; clusterers reach 36+. Random tile queues ensure every session is a fresh placement puzzle.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as BlokusClassicSettings),
  reducer,
  isTerminal,
  component: BlokusClassicGame,
};
