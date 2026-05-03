import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PigState, PigAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const Pig = /* @__PURE__ */ lazy(() => import("./Pig.js").then((mod) => ({ default: mod.Pig as unknown as React.ComponentType<unknown> })));
export const pigSettings = {
  target: {
    kind: "enum" as const,
    label: "Target",
    options: ["50", "100", "200"] as const,
    default: "100" as const,
  },
  botStrategy: {
    kind: "enum" as const,
    label: "Bot strategy",
    options: ["cautious", "aggressive", "hold-at-20"] as const,
    default: "hold-at-20" as const,
  },
} as const;

type PigSettingsType = SettingsOf<typeof pigSettings>;

export const pigPlugin: GamePlugin<PigState, PigAction, typeof pigSettings> = {
  id: "pig",
  title: "Pig",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Push-your-luck dice race to the target. Roll a 1 and lose your turn score.",
  howToPlay: `Be the first to reach the target score — 50, 100, or 200 — by rolling a single die and banking points without rolling a 1.

On your turn, click "Roll" to roll the die. Any result from 2–6 is added to your running turn score and you can keep rolling. If you roll a 1 you bust: your entire turn score is lost and the bot immediately takes its turn. Click "Bank" at any time to add your current turn score to your permanent total and pass to the bot. The bot plays its whole turn automatically and its result is shown as a message. First player to reach or exceed the target wins.

The bot strategy is configurable: Cautious banks after accumulating 15+, Hold-at-20 banks after 20+, and Aggressive banks only after 30+. A bot that can win by banking will always do so regardless of strategy.

Scoring: your final score is your permanent total (the number shown in the score display) — not a win/loss value. If you win by reaching the target, that total is recorded as your score.

Tips: the break-even roll count per turn is around 4–5. If you're close to the target, bank early rather than risk a bust.`,
  settings: pigSettings,
  initialState: (seed: number, settings: PigSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: PigState): HintTarget | null => {
    if (state.winner !== null || state.turn !== 0) return null;
    // Conservative push-your-luck heuristic: if banking would clinch the
    // win, suggest Bank. Otherwise, while the player's score is still
    // below target and the running turn-score is < 20, suggest Roll.
    const humanScore = state.scores[0];
    if (humanScore + state.turnScore >= state.targetScore && state.turnScore > 0) {
      return { selector: '[data-testid="hint-target-pig-bank"]', pulses: 3 };
    }
    if (humanScore < state.targetScore && state.turnScore < 20) {
      return { selector: '[data-testid="hint-target-pig-roll"]', pulses: 3 };
    }
    // Already past the safe threshold this turn — lock in the points.
    return { selector: '[data-testid="hint-target-pig-bank"]', pulses: 3 };
  },
  component: Pig,
};
