import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TripleDiceState, TripleDiceAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const TripleDice = /* @__PURE__ */ lazy(() => import("./TripleDice.js").then((mod) => ({ default: mod.TripleDice as unknown as React.ComponentType<unknown> })));
export const tripleDiceSettings = {
  rounds: {
    kind: "enum" as const,
    label: "Rounds",
    options: ["5", "7", "10"] as const,
    default: "7",
  },
} as const;

type TripleDiceSettingsType = SettingsOf<typeof tripleDiceSettings>;

export const tripleDicePlugin: GamePlugin<TripleDiceState, TripleDiceAction, typeof tripleDiceSettings> = {
  id: "triple-dice",
  title: "Triple Dice",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Roll three dice up to three times per round to score triples, pairs, and straights.",
  howToPlay: `Triple Dice is a push-your-luck dice game played over several rounds. Each round you start with three dice already rolled. You can re-roll any or all dice up to two more times (three rolls total per round), then your dice are scored automatically.

Click any die to keep it (it turns gold) before you re-roll — kept dice stay as-is while unkept dice are re-rolled. You can change which dice are kept between rolls.

Scoring: Triple (all three matching) scores the face value times ten — rolling three 6s gives 60 points. Pair (two matching) scores the pair value times three plus the odd die. Straight (1-2-3 or 4-5-6) scores 25 points. Any other combination scores the plain sum of all three dice.

Strategy: always try to hold high-value pairs or any die showing 6 after the first roll. If you have two 6s, hold them and chase the triple. Straights are hard to hit on purpose but worth holding if you need two dice aligned.

Rounds: choose 5, 7, or 10 rounds. Longer games smooth out luck and reward consistent decision-making. Score is rated out of 100 based on how close you came to the theoretical maximum.`,
  settings: tripleDiceSettings,
  initialState: (seed: number, settings: TripleDiceSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state) => {
    if ((state as any).gameOver) return null;
    return { selector: '[data-testid="hint-target-triple-dice-roll"]', pulses: 3 };
  },
  component: TripleDice,
};
