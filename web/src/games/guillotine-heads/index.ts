import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GuillotineHeadsState, GuillotineHeadsAction, GuillotineHeadsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const GuillotineHeadsGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.GuillotineHeadsGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const guillotineHeadsPlugin: GamePlugin<GuillotineHeadsState, GuillotineHeadsAction, typeof settings> = {
  id: "guillotine-heads", title: "Guillotine Heads", category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Pick the noble queue with highest total value.",
  howToPlay: "Guillotine Heads adapts the French Revolution card game's queue-collection scoring. Each of fifteen rounds shows four noble queues with different total point values; pick the queue with highest total worth, hit Submit, score ten points. Max 150 points across the fifteen rounds. Each queue value is randomly generated between 5 and 35 points, so distinguishing the highest is a quick numeric comparison. The original Guillotine has players collecting heads from a queue with action cards rearranging the line; this digital version focuses on the post-collection scoring assessment. Fast comparators hit perfect 150 in under a minute. Beginners 130+. Hit Submit and Next. Total run takes about a minute. Guillotine Heads makes a solid arithmetic-comparison drill for younger players or a quick warm-up for serious card-game sessions. Tied highest values are pre-deduplicated during generation.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as GuillotineHeadsSettings),
  reducer, isTerminal, hint: (state: GuillotineHeadsState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-guillotine-heads-answer-0"]', pulses: 3 } : null, component: GuillotineHeadsGame,
};
