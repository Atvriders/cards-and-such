import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MedievalDiceState, MedievalDiceAction, MedievalCategory } from "./state.js";
import { initialState, reducer, isTerminal, ALL_MEDIEVAL_CATEGORIES, computeMedievalScore } from "./state.js";
const MedievalDice = /* @__PURE__ */ lazy(() => import("./MedievalDice.js").then((mod) => ({ default: mod.MedievalDice as unknown as React.ComponentType<unknown> })));
export const medievalDiceSettings = {
  rounds: {
    kind: "enum" as const,
    label: "Rounds",
    options: ["6", "8", "10"] as const,
    default: "8",
  },
} as const;

type MedievalDiceSettingsType = SettingsOf<typeof medievalDiceSettings>;

export const medievalDicePlugin: GamePlugin<MedievalDiceState, MedievalDiceAction, typeof medievalDiceSettings> = {
  id: "medieval-dice",
  title: "Medieval Dice",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Roll 4 dice to score castle-themed combinations across 8 rounds of medieval conquest!",
  howToPlay: `Medieval Dice is a castle-siege scoring game using four dice over 6, 8, or 10 rounds. Each round you may roll up to three times, keeping dice between rolls by clicking them.

After rolling you must assign your current dice to one of eight castle-themed categories — each may only be scored once. Categories reward different dice patterns: Peasants scores the total of all 1s and 2s. Knights scores all 3s and 4s. Siege scores 60 for four of a kind. Catapult scores face value × 15 for three of a kind. Moat scores 50 if all dice are even. Tower scores 50 if all dice are odd. Castle scores the sum of two pairs. Rampage scores the sum of all four dice.

You have fewer rounds than categories if playing 6 rounds, so choosing which categories to target — and which to sacrifice — is key. A Siege or Catapult score can be decisive, but don't neglect Moat and Tower if the dice cooperate. Plan your scoring order carefully and maximize your total!`,
  settings: medievalDiceSettings,
  initialState: (seed: number, settings: MedievalDiceSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: MedievalDiceState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.rollsUsed < 3) {
      return { selector: '[data-testid="hint-target-medieval-dice-roll"]', pulses: 3 };
    }
    const unused = ALL_MEDIEVAL_CATEGORIES.filter((c) => !(c in state.scores)) as MedievalCategory[];
    if (unused.length === 0) return null;
    let bestCat = unused[0]!;
    let bestScore = computeMedievalScore(state.dice, bestCat);
    for (const c of unused) {
      const s = computeMedievalScore(state.dice, c);
      if (s > bestScore) { bestScore = s; bestCat = c; }
    }
    return { selector: `[data-testid="hint-target-medieval-dice-cat-${bestCat}"]`, pulses: 3 };
  },
  component: MedievalDice,
};
