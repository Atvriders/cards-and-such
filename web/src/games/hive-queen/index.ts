import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { HiveQueenState, HiveQueenAction, HiveQueenSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { HiveQueenGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const hiveQueenPlugin: GamePlugin<HiveQueenState, HiveQueenAction, typeof settings> = {
  id: "hive-queen",
  title: "Hive Queen",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Insect-themed tile placement; protect the queen with workers.",
  howToPlay: `Hive is a chess-like insect tile game where you protect your queen bee. In this adaptation, place 14 random insect tiles on a 5x5 grid. The first tile placed is automatically your QUEEN (always at position 12, the center). Subsequent tiles can be placed in any empty cell.

Insect types: queen (1, fixed center), bee (worker), beetle (climber), ant (mover), spider (anchor), grasshopper (jumper).

Scoring at end:
• Queen surrounded on all 4 orthogonal sides by friendly tiles (any non-queen): +20 points (queen safe!).
• Each beetle adjacent to the queen: +5 points (close protection).
• Each ant: +2 points base; +3 bonus if there are 3+ ants (swarm bonus).
• Each spider: +3 points if cornered (placed in any corner cell).
• Each grasshopper: +1 point per non-grasshopper neighbor (rewards leaping to populated areas).

Protect the queen first; everything else stacks. A great Hive Queen run scores 35-55 points.`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as HiveQueenSettings),
  reducer,
  isTerminal,
  component: HiveQueenGame,
};
