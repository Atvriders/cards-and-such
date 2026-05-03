import type { GamePlugin } from "../../platform/game-plugin/types.js";
import { initialState, reducer, isTerminal, type TennisServeState, type TennisServeAction } from "./state.js";
import { TennisServe } from "./Game.js";

export const tennisServeSettings = {
  serves: { kind: "enum" as const, label: "Service Points", options: ["10", "20"] as const, default: "10" as const },
} as const;

export const tennisServePlugin: GamePlugin<TennisServeState, TennisServeAction, typeof tennisServeSettings> = {
  id: "tennis-serve",
  title: "Tennis Serve",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "10-serve session. Aim and power to hit the service box. Score aces, avoid double faults.",
  howToPlay: `Tennis Serve puts you at the baseline for a serving session of 10 (or 20) service points. Each point begins with your first serve — you have two chances to land the ball in the diagonal service box before giving away a double fault.

Before serving, check the Wind indicator and whether you're on your first or second serve. First serves are aggressive: 80% power is ideal, giving maximum pace and ace potential. Second serves are conservative: dial back to 65% power to improve accuracy and avoid the double fault.

Set your Angle (center is cross-court — adjust slightly against wind) and Power, then click Serve! The physics engine factors in your angle deviation from ideal, power deviation, and wind to determine if the ball lands in the service box.

Possible outcomes: Ace (ball in + unreturnable — bonus points!), In (serve lands in box — point continues), Fault (misses box on first serve — second serve chance), or Double Fault (misses on second serve — point lost).

Score is calculated as: aces × 100 + successful serves × 50 − double faults × 30. Maximize aces on first serve and stay consistent on second serves to build a high score!`,
  settings: tennisServeSettings,
  initialState,
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".ts-btn", pulses: 3 }; },
  component: TennisServe,
};
