import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { Make24State, Make24Action } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Make24 } from "./Make24.js";

export const make24Settings = {
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "medium", "hard"] as const,
    default: "easy" as const,
  },
} as const;

type Make24SettingsType = SettingsOf<typeof make24Settings>;

export const make24Plugin: GamePlugin<Make24State, Make24Action, typeof make24Settings> = {
  id: "make-24",
  title: "Make 24",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Make 24 using four numbers and +, −, ×, ÷. Each number exactly once.",
  howToPlay: `Make 24 gives you four numbers (between 1 and 9) and asks you to combine them using addition, subtraction, multiplication, and division — plus parentheses — to reach exactly 24. You must use each number exactly once.

Type your expression in the input box. Use the standard keyboard symbols: + for plus, - for minus, * for multiply, and / for divide. Parentheses are allowed and often necessary. Press Enter or click Check to evaluate.

Examples: if your numbers are 1, 2, 3, 4 you could write (1+2+3)*4 or 1*2*3*4 (which equals 24). If your numbers are 3, 3, 7, 7 you might try (3+3/7)*7.

The puzzle checks that your expression uses exactly the four numbers shown (each exactly once) and that the result equals 24 within rounding tolerance.

Scoring: 1000 minus 100 per failed attempt, floored at 100. Solve it first try for maximum score.

Difficulty controls which puzzle sets are chosen — Easy has many valid solutions per puzzle, Medium fewer, and Hard may have only one or two tricky solutions. If you're stuck, try working backwards: what two numbers multiply to 24? (6×4, 8×3, 12×2, 24×1) Can you make those from your four numbers?`,
  settings: make24Settings,
  initialState: (seed: number, settings: Make24SettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".make-24-btn", pulses: 3 }; },
  component: Make24,
};
