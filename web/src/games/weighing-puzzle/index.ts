import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { WeighingState, WeighingAction, WeighingSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { WeighingPuzzleGame } from "./Game.js";

const settings = {} as const;

export const weighingPuzzlePlugin: GamePlugin<WeighingState, WeighingAction, typeof settings> = {
  id: "weighing-puzzle",
  title: "Weighing Puzzle",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Classic balance-scale logic puzzle — deduce the odd ball from a set of weighing results.",
  howToPlay: `Weighing Puzzle is a classic logic challenge. You are given a set of numbered balls — all look identical, but one is either slightly heavier or slightly lighter than the rest.

The puzzle shows you the results of several balance-scale weighings. Each weighing tells you which balls were placed on the left pan, which were on the right, and whether the left side was heavier, the right was heavier, or the two pans balanced equally.

Your job: use deductive reasoning from those weighing results to identify which ball is the odd one out, and whether it is heavier or lighter.

To answer, click on the ball number you believe is the odd one, then select whether you think it is Heavier or Lighter, and press Submit Answer.

Key strategies: if a weighing balances equally, all balls on both pans are normal — eliminate them. If a side tips, focus on the balls unique to that side. Cross-reference multiple weighings to narrow candidates to exactly one ball.

After submitting, you can try a new puzzle with different parameters. Each correct answer scores 1000 points. Train your logical deduction skills and see how quickly you can master the more complex 12-ball, 3-weighing version!`,
  settings,
  initialState: (seed: number, s: WeighingSettings) => initialState(seed, s),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".weighing-submit-btn", pulses: 3 }; },
  component: WeighingPuzzleGame,
};
