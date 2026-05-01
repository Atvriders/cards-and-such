import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { OnTourRoadsState, OnTourRoadsAction, OnTourRoadsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { OnTourRoadsGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const onTourRoadsPlugin: GamePlugin<OnTourRoadsState, OnTourRoadsAction, typeof settings> = {
  id: "on-tour-roads",
  title: "On Tour Roads",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "On Tour — roll dice and route across US states in long chains.",
  howToPlay: `On Tour Roads is a strict-ascending placement dice game.

How to play
1. Press Roll for a d12.
2. Place the number into any slot in any of the 3 rows of 5 — but each row must remain strictly ascending.
3. Place gives die value + adjacency bonus (+2 if a neighbor is exactly one less or more).
4. Skip if no legal slot — costs −1 to score.

Theme: Longest ascending chain rewarded.

End-of-game bonuses
- Each completed row: +6
- Full board: +10

Game ends after 12 rolls or when all 15 slots are filled. Strong runs reach 60-100.`,
  settings,
  initialState: (seed, s) => initialState(seed, s as OnTourRoadsSettings),
  reducer,
  isTerminal,
  component: OnTourRoadsGame,
};
