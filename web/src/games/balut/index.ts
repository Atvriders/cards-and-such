import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BalutState, BalutAction, BalutCategory } from "./state.js";
import { initialState, reducer, isTerminal, ALL_BALUT_CATEGORIES, computeBalutScore } from "./state.js";
const Balut = /* @__PURE__ */ lazy(() => import("./Balut.js").then((mod) => ({ default: mod.Balut as unknown as React.ComponentType<unknown> })));
export const balutSettings = {
  dummy: { kind: "boolean" as const, label: "Standard Rules", default: true },
} as const;

type BalutSettingsType = SettingsOf<typeof balutSettings>;

export const balutPlugin: GamePlugin<BalutState, BalutAction, typeof balutSettings> = {
  id: "balut",
  title: "Balut",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Filipino dice game — 7 categories, bonus for rolling 5 of a kind.",
  howToPlay: `Balut is a popular Filipino dice game played with 5 dice across 7 rounds. Each round you fill one of seven scoring categories. Roll up to 3 times per round, locking dice between rolls.

The 7 categories are: Fours (sum of 4s), Fives (sum of 5s), Sixes (sum of 6s), Straight (1-2-3-4-5 or 2-3-4-5-6, scores 25 points), Full House (3 of a kind plus a pair, scores sum of all dice), Choice (sum of all dice), and Balut (5 of a kind, scores sum of all dice).

Special bonus: if you successfully roll a Balut (five of a kind) in the Balut category, you earn a 20-point bonus added to your final total.

Click "Roll Dice" to roll all 5 dice. Click any die to lock it between rolls. After rolling, click a category to score it. Each category can only be filled once.

Tips: prioritise the Balut category — even scoring 0 there is possible, but the 20-point bonus for a successful Balut is valuable. Use Choice as your safety valve when nothing better fits. Sixes is the highest-value upper category so keep sixes whenever possible.`,
  settings: balutSettings,
  initialState: (seed: number, settings: BalutSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: BalutState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.rollsUsed < 3) {
      return { selector: '[data-testid="hint-target-balut-roll"]', pulses: 3 };
    }
    const unused = ALL_BALUT_CATEGORIES.filter((c) => !(c in state.scores)) as BalutCategory[];
    if (unused.length === 0) return null;
    let bestCat = unused[0]!;
    let bestScore = computeBalutScore(state.dice, bestCat);
    for (const c of unused) {
      const s = computeBalutScore(state.dice, c);
      if (s > bestScore) { bestScore = s; bestCat = c; }
    }
    return { selector: `[data-testid="hint-target-balut-cat-${bestCat}"]`, pulses: 3 };
  },
  component: Balut,
};
