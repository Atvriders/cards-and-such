import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { Life1dState, Life1dAction, Life1dSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Life1dGame } from "./Game.js";

const settings = {
  rule: { kind: "enum" as const, label: "Rule", options: ["30", "90", "110"] as const, default: "30" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const life1dPlugin: GamePlugin<Life1dState, Life1dAction, typeof settings> = {
  id: "life-1d",
  title: "Life 1D",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "1D cellular automaton — Wolfram rule 30, 90, or 110. Step generations and watch patterns evolve.",
  howToPlay: `Life 1D is a one-player simulation of a 1D cellular automaton, the kind Stephen Wolfram catalogued in his "elementary cellular automata" classification. The world is a single 32-cell row that wraps at the edges. Each generation, every cell's new value depends on itself plus its two neighbors, using one of three famous rules:

— Rule 30: chaotic, looks random. Used by Mathematica's Random function.
— Rule 90: symmetric Sierpinski-triangle fractal patterns.
— Rule 110: provably Turing-complete, mixes structure and chaos.

How to play:
1. Pick the rule in settings before starting.
2. The seed pattern is a single live cell in the middle of the row.
3. Press Step to advance one generation. Press Step x10 for ten at a time. Press Reset to start over.
4. Press Finish to lock in your score.

Your score = (unique row patterns seen × 5) + total generations. Rule 30 produces the most unique patterns by far. Rule 90 cycles symmetric Sierpinski triangles. Rule 110 mixes localized "particles" with chaos. Aim for over 200 — Rule 30 makes that easy after about 30 steps.`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as Life1dSettings),
  reducer,
  isTerminal,
  component: Life1dGame,
};
