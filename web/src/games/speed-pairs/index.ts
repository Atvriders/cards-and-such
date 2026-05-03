import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SpeedPairsState, SpeedPairsAction, SpeedPairsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const SpeedPairsGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.SpeedPairsGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const speedPairsPlugin: GamePlugin<SpeedPairsState, SpeedPairsAction, typeof settings> = {
  id: "speed-pairs", title: "Speed Pairs", category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Spot the duplicate among 4 cards.",
  howToPlay: "Speed Pairs strips memory matching down to its fastest essentials. Each round shows you four cards laid out in a 2x2 grid; exactly one card-rank appears twice (the duplicate) and two singletons fill the rest. Tap either of the two matching cards. Correct picks score ten points each. The card-rank pool spans Aces through twos so each round looks varied. Fifteen rounds total — maximum score 150 points. The visual challenge is calibrated for sub-second decisions: trained players spot duplicates in 200ms; first-timers take 1-2 seconds. Both feel snappy. Speed Pairs makes a great five-minute brain break or warm-up for longer card sessions. Each round is independent — there is no carry-over of state, no time bonus, just pure scan-and-match. Hit Submit after picking and Next to continue. Aim for 12+ correct out of fifteen for a strong run; perfect 150 is achievable for sharp scanners.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SpeedPairsSettings),
  reducer, isTerminal, hint: (state: SpeedPairsState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-speed-pairs-answer-0"]', pulses: 3 } : null, component: SpeedPairsGame,
};
