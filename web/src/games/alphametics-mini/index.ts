import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { AlphameticsMiniState, AlphameticsMiniAction, AlphameticsMiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { AlphameticsMiniGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
export const alphameticsMiniPlugin: GamePlugin<AlphameticsMiniState, AlphameticsMiniAction, typeof settings> = {
  id: "alphametics-mini",
  title: "Alphametics Mini",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Word arithmetic: each letter is a unique digit. Solve the equation.",
  howToPlay: "Alphametics is a classic puzzle where letters in a written equation each stand for a unique digit (0-9). The most famous example is SEND + MORE = MONEY. Your job is to determine what digit each letter represents so the addition or subtraction works out.\n\nIn this mini version each puzzle shows a small word equation in the grid. Beneath, a multiple-choice question asks for the digit value of one specific letter. Apply the constraints — leading digits can't be zero, every letter is a different digit — and pick the right answer.\n\nSix puzzles per round, ranging from two-letter sums (AB + B = CC) up to short word puzzles. Wrong picks reveal the correct value and answer color shifts. Scoring is 100 per correct answer with a 10-point time bonus per remaining second.\n\nAlphametics blends arithmetic intuition with deduction. Common patterns: if A + A = A in a column, then A is 0 or carries from below. If B + 1 = B (with carry) then B can't exist without considering positional flow. Get the rhythm and you'll fly.",
  settings,
  initialState: (seed: number) => initialState(seed, { dummy: true } as AlphameticsMiniSettings),
  reducer,
  isTerminal,
  component: AlphameticsMiniGame,
};
