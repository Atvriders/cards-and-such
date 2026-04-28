import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { HashiwokakeroMiniState, HashiwokakeroMiniAction, HashiwokakeroMiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { HashiwokakeroMiniGame } from "./Game.js";

const settings = {
  puzzles: { kind: "enum" as const, label: "Puzzles", options: ["8"] as const, default: "8" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const hashiwokakeroMiniPlugin: GamePlugin<HashiwokakeroMiniState, HashiwokakeroMiniAction, typeof settings> = {
  id: "hashiwokakero-mini",
  title: "Hashiwokakero Mini",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: `Mini Bridges puzzle: choose where to draw single bridges between islands.`,
  howToPlay: `Hashiwokakero (Bridges) is a Japanese logic puzzle by Nikoli. Numbered "islands" must be connected by horizontal or vertical "bridges" (no crossing) such that each island has exactly the indicated number of bridges and all islands form one connected network. At most two bridges can connect a single pair of islands.

In this solo logic-puzzle adaptation, each puzzle shows a small island layout and asks which bridge to add next on the unique solving path. Pick from candidate moves.

Eight puzzles per session, 100 points each (800 max).

Tips: classic Bridges techniques include: an island with degree N adjacent to K neighbours where 2K − 1 ≤ N must use double bridges to all neighbours; an island of degree 1 with a single neighbour must use a single bridge; and corner islands of degree 4 with two neighbours must use double bridges to both. After every step, check connectivity — partial subgraphs that would isolate forbid certain bridges.`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as HashiwokakeroMiniSettings),
  reducer,
  isTerminal,
  component: HashiwokakeroMiniGame,
};
