import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { EightPuzzleState, EightPuzzleAction, EightPuzzleSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const EightPuzzleGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.EightPuzzleGame as unknown as React.ComponentType<unknown> })));
const settings = {
  dummy: { kind: "boolean" as const, label: "dummy", default: false },
} as const;
type S = SettingsOf<typeof settings>;

export const eightPuzzlePlugin: GamePlugin<EightPuzzleState, EightPuzzleAction, typeof settings> = {
  id: "eight-puzzle",
  title: "Eight Puzzle",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Classic 3x3 sliding-tile puzzle: arrange 1-8 with one blank cell.",
  howToPlay: `The Eight Puzzle is the 3x3 cousin of the Fifteen Puzzle: eight numbered tiles plus one blank cell. It is the canonical AI search problem and a fast, satisfying logic exercise.

Click any tile orthogonally adjacent to the blank to slide it into the gap. Tiles already in their goal home position turn green so you can track progress at a glance.

Tips: solve top-row-then-left-column first. The "last two of a row" trick rotates three tiles using the blank. Optimal eight-puzzle solutions average around 22 moves from a fully-shuffled start; the worst-case is 31 moves.

Scoring: 500 points minus 5 per move with a 50-point floor. Random walks from solved guarantee every shuffle is solvable.`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as EightPuzzleSettings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".ep-btn", pulses: 3 }; },
  component: EightPuzzleGame,
};
