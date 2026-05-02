import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ApplePieStackState, ApplePieStackAction, ApplePieStackSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ApplePieStackGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const applePieStackPlugin: GamePlugin<ApplePieStackState, ApplePieStackAction, typeof settings> = {
  id: "apple-pie-stack", title: "Apple Pie Stack", category: "arcade",
  players: { min:1, max:1, multiplayer:false },
  description: "Stack slices of apple pie by setting the perfect power — land close to the target for maximum points!",
  howToPlay: `Apple Pie Stack challenges you to stack pie slices at just the right power. Each round, set the power slider and press Go! to toss a slice. The closer your power is to the secret target, the more points you score. 10 rounds of stacking — aim for 100 points per round for a perfect game!`,
  settings,
  initialState: (seed:number, s:S) => initialState(seed, s as ApplePieStackSettings),
  reducer, isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-apple-pie-stack-action"]', pulses: 3 }; },
  component: ApplePieStackGame,
};
