import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { ChineseRingsState, ChineseRingsAction, ChineseRingsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ChineseRingsGame } from "./Game.js";

const settings = {
  puzzles: { kind: "enum" as const, label: "Puzzles", options: ["8"] as const, default: "8" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const chineseRingsPlugin: GamePlugin<ChineseRingsState, ChineseRingsAction, typeof settings> = {
  id: "chinese-rings",
  title: "Chinese Rings (Baguenaudier)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: `Disentanglement puzzle: figure out the next ring move to remove all rings.`,
  howToPlay: `Chinese Rings (also called Baguenaudier or Patience Puzzle) is a 17th-century mechanical disentanglement puzzle. Several metal rings are linked through a wire loop, and the goal is to remove all rings. Removing or replacing ring N is only allowed when ring N−1 is on the loop and rings 1 through N−2 are off — a constraint that mirrors Gray-code counting.

In this solo puzzle adaptation, each puzzle gives you a current ring configuration (which rings are on the loop, which are off) and asks which legal move comes next on the optimal solving path. Pick from the candidate moves.

Eight puzzles per session, 100 points each (800 max).

Tips: the optimal path encodes binary as a Gray code — each move flips exactly one ring's state, and the legal flips alternate. Ring 1 can always be moved freely. Ring N (N>1) can move only if ring N−1 is on and rings 1..N−2 are off. With 5 rings the optimal solution takes 21 moves. Memorising Gray-code transitions makes the puzzle straightforward.`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ChineseRingsSettings),
  reducer,
  isTerminal,
  component: ChineseRingsGame,
};
