import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { Magic8BallState, Magic8BallAction, Magic8BallSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Magic8Ball } from "./Game.js";

const settings = {
  shakeCount: {
    kind: "enum" as const,
    label: "Shake Limit",
    options: ["10", "20", "unlimited"] as const,
    default: "unlimited" as const,
  },
} as const;

export const magic8BallPlugin: GamePlugin<Magic8BallState, Magic8BallAction, typeof settings> = {
  id: "magic-8-ball",
  title: "Magic 8-Ball",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Ask the Magic 8-Ball any yes/no question and receive one of 20 classic answers.",
  howToPlay: `The Magic 8-Ball is the classic fortune-telling toy from the 1950s, now playable on screen. Think of a yes/no question — anything you're genuinely curious about — type it into the box, and click Shake to consult the mystic ball.

The ball's triangular window reveals one of 20 classic responses drawn from the original Magic 8-Ball lineup. Ten answers are positive (green), five are neutral/evasive (blue), and five are negative (red). The exact answer is determined by the game's seeded random number generator, so each shake produces a reproducible yet unpredictable result.

Your question history is shown below the ball so you can review all of your session's prophecies. Positive answers count toward your final score.

Play modes: choose a 10-shake or 20-shake limit to create a structured game with a definite end, or pick Unlimited for an open-ended session where you can ask as many questions as you like before resetting.

Tips: there are no real tips for a random oracle! But the tradition is to ask sincerely, shake (click), and receive your answer without peeking until after you've committed to a question. Asking the same question twice may yield a different answer — the spirits are fickle.`,
  settings,
  initialState: (seed: number, s: Magic8BallSettings) => initialState(seed, s),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".m8b-shake-btn", pulses: 3 }; },
  component: Magic8Ball,
};
