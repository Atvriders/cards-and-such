import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceBullseyeRollState, DiceBullseyeRollAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const DiceBullseyeRoll = /* @__PURE__ */ lazy(() => import("./DiceBullseyeRoll.js").then((mod) => ({ default: mod.DiceBullseyeRoll as unknown as React.ComponentType<unknown> })));
export const diceBullseyeRollSettings = { rounds: { kind: "enum" as const, label: "Rounds", options: ["5","10","15"] as const, default: "10" as const } } as const;
type S = SettingsOf<typeof diceBullseyeRollSettings>;
export const diceBullseyeRollPlugin: GamePlugin<DiceBullseyeRollState, DiceBullseyeRollAction, typeof diceBullseyeRollSettings> = {
  id: "dice-bullseye-roll", title: "Dice Bullseye Roll", category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Roll two dice and try to hit the target sum exactly for maximum points.",
  howToPlay: `Dice Bullseye Roll challenges you to hit a random target number with two dice. Each round a target between 2 and 12 is set, then two dice are rolled automatically. Score points based on how close your roll is to the target: an exact match earns 20 points (bullseye!), one away earns 10, two away earns 5, and further away scores nothing. Click Next Roll to proceed to the following round and a new target. Play 5, 10, or 15 rounds. Tips: The most likely two-dice totals are 6, 7, and 8 — they appear most frequently. Targets of 2 or 12 are hardest to hit but score 20 when you do. Watch for streaks of luck when targets align with common totals.`,
  settings: diceBullseyeRollSettings,
  initialState: (seed: number, settings: S) => initialState(seed, settings),
  reducer, isTerminal, 
  hint: (state: any) => { if ((state as any).phase === "gameover" || (state as any).gameOver) return null; return { selector: '[data-testid="hint-target-dice-bullseye-roll-roll"]', pulses: 3 }; },
  component: DiceBullseyeRoll,
};
