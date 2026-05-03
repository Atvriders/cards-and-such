import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CorralState, CorralAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Corral } from "./Corral.js";

const corralSettings = {
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "hard"] as const,
    default: "easy",
  },
} as const;

type S = SettingsOf<typeof corralSettings>;

export const corralPuzzlePlugin: GamePlugin<CorralState, CorralAction, typeof corralSettings> = {
  id: "corral-puzzle",
  title: "Corral",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Draw a closed loop; each number shows how many interior cells are visible along its row and column.",
  howToPlay: `Corral (also called Bag) is a loop-drawing puzzle. Your goal is to draw a single closed loop along the grid lines so that all the numbered cells lie inside the loop.

Each number is a count: from that cell, looking in all four cardinal directions (up, down, left, right) along the interior of the loop without crossing the loop boundary, the total number of cells you can see — including the cell you are standing in — must exactly equal the clue number. Cells outside the loop are invisible.

To draw the loop, click near the midpoint of an edge between two adjacent dots. Click again to erase that edge. The loop turns green when the puzzle is solved.

Strategy: start with high numbers — they tell you that long corridors of cells must be enclosed. A number equal to a full row or column forces the loop to span that entire line. Corner numbers constrain both their row and column simultaneously. Use these deductions to gradually pin down the exact loop path.

Click Reset to start fresh.`,
  settings: corralSettings,
  initialState: (seed: number, settings: S) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver || (s as any).won || (s as any).isWon || (s as any).isComplete || (s as any).complete) return null; return { selector: '[data-testid="hint-target-corral-puzzle-action"]', pulses: 3 }; },
  component: Corral,
};
