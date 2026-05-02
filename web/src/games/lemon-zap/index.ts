import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { LemonZapState, LemonZapAction, LemonZapSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { LemonZapGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const lemonZapPlugin: GamePlugin<LemonZapState, LemonZapAction, typeof settings> = {
  id: "lemon-zap", title: "Lemon Zap", category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Zap lemons drifting across the citrus grove in 30 seconds.",
  howToPlay: `Lemon Zap is a 30-second clicker arcade. Bright yellow lemons drift across the citrus grove in six lanes; tap them as fast as you can to zap them for 10 points apiece. Lemons linger a few ticks before drifting off — miss too many and your score will suffer.

The board ticks roughly every three quarters of a second, spawning fresh lemons in random lanes. The screen quickly fills with sour targets, so practice your hand-eye coordination.

There is no skill ceiling: the more lemons you zap in 30 seconds, the higher your score. Beginner runs land near 150-250 points; sharp tappers pushing 400+ are showing real reflex talent. The countdown clock ticks in the top right; when it hits zero, your final score is locked in.

Zap those lemons and rack up the points!`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as LemonZapSettings),
  reducer, isTerminal,
  hint: (state: LemonZapState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (!state.targets || state.targets.length === 0) return null;
    return { selector: '[data-testid="hint-target-lemon-zap-target"]', pulses: 3 };
  },
  component: LemonZapGame,
};
