import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { PubState, PubAction, PubSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PubGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const shuffleboardTablePlugin: GamePlugin<PubState, PubAction, typeof settings> = {
  id: "shuffleboard-table",
  title: "Shuffleboard (Table)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Slide weighted pucks toward scoring zone.",
  howToPlay: "Shuffleboard (Table) reproduces the classic American/British pub table-shuffleboard where weighted pucks slide down a long polished surface toward scoring zones. Across eight rounds you press Slide to launch a puck; a random distance determines which zone it lands in: 1-point, 2-point, 3-point, or 4-point zones, with about a 12% chance of scoring 4, 25% chance of 3, 28% of 2, and the rest 1 or off-board (0). The CPU slides simultaneously each round. Total score after eight rounds wins. The 'hangs over' edge gives bonus 4-point throws when the puck just barely overhangs the far edge — a satisfying tactile feel reproduced here through the slim 4-point probability. Bar-pub shuffleboard is hugely popular in the American Midwest and northern English pubs alike. Press Slide each round; the result reveals immediately. Final scoreboard tallies your total against the CPU's; 100 points for the win, 25 for a tie. Knock-off rules are not implemented in this digital simplification.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as PubSettings),
  reducer,
  isTerminal,
  component: PubGame,
};
