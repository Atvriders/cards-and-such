import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SpringJumpState, SpringJumpAction, SpringJumpSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SpringJumpGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const springJumpPlugin: GamePlugin<SpringJumpState, SpringJumpAction, typeof settings> = {
  id: "spring-jump", title: "Spring Jump", category: "arcade",
  players: { min:1, max:1, multiplayer:false },
  description: "Set spring tension and launch a frog for maximum distance! 10 jumps, highest cumulative score wins.",
  howToPlay: `Spring Jump is a distance game where you control the tension of a spring to launch a frog as far as possible. Too little tension and the frog barely leaves the ground. Too much and the spring recoils, wasting energy. Find the sweet spot!

You have 10 jumps per game. For each jump, set the tension slider and press Jump. Your score for each jump depends on the distance achieved, up to 100 points per jump.

Subtle wind variations affect each jump differently — what worked for jump 3 may need adjustment for jump 7.

Study your results after each jump and fine-tune your tension for the next. Consistent performance across all 10 jumps will yield the highest total score. Can you master the spring?`,
  settings,
  initialState: (seed:number, s:S) => initialState(seed, s as SpringJumpSettings),
  reducer, isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-spring-jump-action"]', pulses: 3 }; },
  component: SpringJumpGame,
};
