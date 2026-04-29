import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { PubState, PubAction, PubSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PubGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const nineMensMorrisPubPlugin: GamePlugin<PubState, PubAction, typeof settings> = {
  id: "nine-mens-morris-pub",
  title: "Nine Men's Morris (Pub)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Three-phase mill game on a painted pub board.",
  howToPlay: "Nine Men's Morris (Pub) plays the classic three-phase mill game on the rough painted pub board common in British country pubs. In this simplified click adaptation across ten turns, you place pieces on intersections trying to form mills (three in a row). Each round press Place to drop a piece on a random intersection; if it forms a mill you score 10 points, otherwise you score 1. The CPU also places each round and may form its own mills. After ten rounds the higher score wins. The pub variant uses informal rules — no movement phase, no flying, no captures, just rapid placement and mill-counting. Painted pub boards date to medieval taverns where they were chalked or carved into wooden tables. The mechanic here strips the game to its score-and-mill core; classical tournament Morris is much deeper. Press Place to advance; the score updates after each round. Final scoreboard awards 100 points for the win.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as PubSettings),
  reducer,
  isTerminal,
  component: PubGame,
};
