import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { ChronogramPuzzleState, ChronogramPuzzleAction, ChronogramPuzzleSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ChronogramPuzzleGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
export const chronogramPuzzlePlugin: GamePlugin<ChronogramPuzzleState, ChronogramPuzzleAction, typeof settings> = {
  id: "chronogram-puzzle",
  title: "Chronogram Puzzle",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Decode hidden Roman-numeral dates from puzzle inscriptions.",
  howToPlay: "Chronogram Puzzle is a classical letter-to-digit decoding game. A chronogram is an inscription where certain capital letters (M, D, C, L, X, V, I) double as Roman numerals; when you sum them, you get a hidden date.\n\nEach round shows a short Latin or English phrase with the encoded letters in a small grid. Your job is to identify the hidden year by adding the Roman-numeral values of the marked letters: M=1000, D=500, C=100, L=50, X=10, V=5, I=1.\n\nFor example, the phrase \"VICTORIA REGINA\" highlights V (5), I (1), C (100), I (1), and so on. Sum to find the date. There are six puzzles per round, ranging from straightforward (three-letter sums) to more nuanced (longer phrases with subtractive notation).\n\nScoring is 100 points per correct answer plus a 10-point time bonus per remaining second. Wrong picks reveal the correct year. Chronograms appeared on European tombs and royal proclamations from the 14th-19th centuries — playing this puzzle plugs you straight into that tradition of cryptic dating.",
  settings,
  initialState: (seed: number) => initialState(seed, { dummy: true } as ChronogramPuzzleSettings),
  reducer,
  isTerminal,
  
  hint: (state: ChronogramPuzzleState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-chronogram-puzzle-answer-0"]', pulses: 3 } : null,component: ChronogramPuzzleGame,
};
