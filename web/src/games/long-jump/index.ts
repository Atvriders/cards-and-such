import type { GamePlugin } from "../../platform/game-plugin/types.js";
import { initialState, reducer, isTerminal, type LongJumpState, type LongJumpAction } from "./state.js";
import { LongJump } from "./Game.js";

export const longJumpSettings = {
  attempts: { kind: "enum" as const, label: "Attempts", options: ["3", "6"] as const, default: "3" as const },
} as const;

export const longJumpPlugin: GamePlugin<LongJumpState, LongJumpAction, typeof longJumpSettings> = {
  id: "long-jump",
  title: "Long Jump",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Sprint down the runway, hit the board, and leap as far as you can without fouling.",
  howToPlay: `Long Jump puts you on the athletics track for a classic runway event. You get 3 or 6 attempts; only your best legal jump counts.

Three controls determine how far you fly. Sprint Speed sets your approach velocity — max speed gives maximum distance. Takeoff Angle controls the launch angle at the board; the ideal is around 45% (low on the slider), which balances horizontal distance and air time. Going too steep wastes forward momentum; too flat and you skip along the ground.

Board Timing is the trickiest control. Hitting right at the board (close to 100%) maximizes distance by using the full runway. However, going over 95% crosses the foul line — your jump is disqualified and you lose the attempt. Aim for 80–93% for the best distance without fouling.

Measurement appears immediately after each jump in metres. Foul attempts show "FOUL" and don't count toward your best.

Scoring is based on your best legal jump distance relative to the world record (8.95m). Reaching 8.5m scores 1000. Olympic qualifying standard is around 8.15m — can you make the team?`,
  settings: longJumpSettings,
  initialState,
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-long-jump-action"]', pulses: 3 }; },
  component: LongJump,
};
