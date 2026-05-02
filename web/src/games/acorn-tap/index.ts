import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { AcornTapState, AcornTapAction, AcornTapSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { AcornTapGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const acornTapPlugin: GamePlugin<AcornTapState, AcornTapAction, typeof settings> = {
  id: "acorn-tap", title: "Acorn Tap", category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Tap falling acorns in the forest in 30 seconds.",
  howToPlay: `Acorn Tap is a 30-second clicker arcade. Ripe acorns fall through the forest in six lanes; tap them as fast as you can to score 10 points each. Acorns linger a few ticks before bouncing off — miss too many and your score will stall.

The board ticks roughly every three quarters of a second, spawning fresh acorns in random lanes. The screen quickly fills with nutty targets, so practice your hand-eye coordination and aim true.

There is no skill ceiling: the more acorns you tap in 30 seconds, the higher your score. Beginner runs land near 150-250 points; sharp tappers pushing 400+ are showing real reflex talent. The countdown clock ticks in the top right; when it hits zero, your final score is locked in.

Tap those acorns and rack up the points!`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as AcornTapSettings),
  reducer, isTerminal, 
  hint: (state: AcornTapState) => {
    if (state.phase === "done") return null;
    if (!state.targets || state.targets.length === 0) return null;
    return { selector: ".acorntap-target", pulses: 3 };
  },
  component: AcornTapGame,
};
