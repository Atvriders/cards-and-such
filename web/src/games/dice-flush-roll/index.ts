import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceFlushRollState, DiceFlushRollAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const DiceFlushRoll = /* @__PURE__ */ lazy(() => import("./DiceFlushRoll.js").then((mod) => ({ default: mod.DiceFlushRoll as unknown as React.ComponentType<unknown> })));
export const diceFlushRollSettings = { rounds: { kind: "enum" as const, label: "Rounds", options: ["5","10","15"] as const, default: "10" as const } } as const;
type S = SettingsOf<typeof diceFlushRollSettings>;
export const diceFlushRollPlugin: GamePlugin<DiceFlushRollState, DiceFlushRollAction, typeof diceFlushRollSettings> = {
  id: "dice-flush-roll", title: "Dice Flush Roll", category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Roll 5 dice and use up to 2 rerolls to match as many as possible for points.",
  howToPlay: `Dice Flush Roll is a matching dice game. You roll five dice and can reroll up to twice, keeping your preferred dice between rerolls. Your goal is to match as many dice to the same number as possible. Scoring: five of a kind earns 50 points, four of a kind earns 30, three of a kind earns 15, a pair earns 5, and no match earns nothing. Click dice to toggle keeping them (highlighted), then click Reroll for unkept dice. When ready, click Score to bank your points and advance to the next round. Play 5, 10, or 15 rounds. Tips: Always keep your largest group of matching dice. Pairs are worth holding — three of a kind is very achievable with two rerolls. If you already have four of a kind, lock them all and try for the fifth.`,
  settings: diceFlushRollSettings,
  initialState: (seed: number, settings: S) => initialState(seed, settings),
  reducer, isTerminal, component: DiceFlushRoll,
  hint: (state: DiceFlushRollState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "rolling" && state.rollsLeft > 0) return { selector: '[data-testid="hint-target-diceflushroll-reroll"]', pulses: 3 };
    if (state.phase === "rolling") return { selector: '[data-testid="hint-target-diceflushroll-score"]', pulses: 3 };
    return null;
  },
};
