import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { DutchWhispersSudokuState, DutchWhispersSudokuAction, DutchWhispersSudokuSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DutchWhispersSudokuGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
export const dutchWhispersSudokuPlugin: GamePlugin<DutchWhispersSudokuState, DutchWhispersSudokuAction, typeof settings> = {
  id: "dutch-whispers-sudoku",
  title: "Dutch Whispers Sudoku",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "On marked Dutch Whispers lines, adjacent digits along the line must differ by at least 4.",
  howToPlay: "Dutch Whispers Sudoku is the easier-going cousin of German Whispers: along orange lines, consecutive cells must differ by at least 4 instead of 5. That means 5 is allowed (1-5 or 5-9 both qualify), and the alternating-high-low pattern relaxes slightly.\n\nStandard Sudoku rules — rows, columns, boxes each containing 1-9 — still apply. Along Dutch Whispers lines, you'll often see chains like 9-1-5-9-3 wandering. The rule of thumb: from any digit d, valid neighbors are those in [1, d-4] union [d+4, 9].\n\nEach puzzle shows a grid with a Dutch Whispers line, a target cell, and four candidate digits. Apply both the row/column and difference-of-4 rules.\n\nSix puzzles per round, 100 points each plus time bonus. Wrong picks reveal the correct value. Dutch Whispers is a gentle introduction to whisper-line constraints — perfect for warming up before tackling the stricter German variant.",
  settings,
  initialState: (seed: number) => initialState(seed, { dummy: true } as DutchWhispersSudokuSettings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".dutchwhispersorange-num", pulses: 3 }; },
  component: DutchWhispersSudokuGame,
};
