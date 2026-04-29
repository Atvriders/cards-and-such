import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { FjordsClaimState, FjordsClaimAction, FjordsClaimSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { FjordsClaimGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const fjordsClaimPlugin: GamePlugin<FjordsClaimState, FjordsClaimAction, typeof settings> = {
  id: "fjords-claim",
  title: "Fjords: Claim",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Two-phase Carcassonne-like tile-and-claim Fjords adaptation.",
  howToPlay: "Fjords is a two-phase Carcassonne-like game where players first place tiles, then claim regions with farmer pieces. In this solo adaptation you place 15 landscape tiles on a 5x5 grid representing four terrain types: water, forest, mountain, and coast. Click any empty cell to place the next tile from the queue. Each placement scores 1 base point plus 1 per orthogonally adjacent same-terrain tile. Strategy: build large connected regions of one terrain at a time, mimicking the second-phase claim mechanic. With four types over 15 tiles you average roughly four of each, opening two-tile clusters or one long band per terrain. After all placements the game finalises. A solid Fjords: Claim score is 26-34 points; a careful regionalist reaches 40+. Random queues ensure each game's terrain unfolds in a fresh sequence.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as FjordsClaimSettings),
  reducer,
  isTerminal,
  component: FjordsClaimGame,
};
