import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { GermanWhispersSudokuState, GermanWhispersSudokuAction, GermanWhispersSudokuSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const GermanWhispersSudokuGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.GermanWhispersSudokuGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
export const germanWhispersSudokuPlugin: GamePlugin<GermanWhispersSudokuState, GermanWhispersSudokuAction, typeof settings> = {
  id: "german-whispers-sudoku",
  title: "German Whispers Sudoku",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "On marked German Whispers lines, adjacent digits along the line must differ by at least 5.",
  howToPlay: "German Whispers Sudoku features special green lines snaking across the grid. Any two cells consecutive along a green line must differ by at least 5. In a 1-9 puzzle that means consecutive line cells alternate between low (1-4) and high (6-9) — the digit 5 cannot appear on a German Whispers line at all.\n\nStandard Sudoku rules apply: each row, column, and box contains digits 1-9 once. The whispers constraint slices the candidate set in half along each green line and forces alternating low/high patterns.\n\nEach round presents a small example with a green line and a target cell. Apply the difference-of-5 rule plus row/column logic to pick the only legal value.\n\nSix puzzles per round, 100 points per correct answer plus speed bonus. Wrong answers reveal the correct value. Once you internalize \"low alternates with high, no 5s\", German Whispers becomes a satisfying pattern-recognition exercise.",
  settings,
  initialState: (seed: number) => initialState(seed, { dummy: true } as GermanWhispersSudokuSettings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".germanwhispersflag-num", pulses: 3 }; },
  component: GermanWhispersSudokuGame,
};
