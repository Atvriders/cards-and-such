import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { YahtzeeState, YahtzeeAction, Category } from "./state.js";
import { initialState, reducer, isTerminal, ALL_CATEGORIES, computeCategoryScore } from "./state.js";
import { Yahtzee } from "./Yahtzee.js";

export const yahtzeeSettings = {
  strictYahtzeeBonus: {
    kind: "boolean" as const,
    label: "Strict Yahtzee Bonus",
    default: true,
  },
} as const;

type YahtzeeSettingsType = SettingsOf<typeof yahtzeeSettings>;

export const yahtzeePlugin: GamePlugin<YahtzeeState, YahtzeeAction, typeof yahtzeeSettings> = {
  id: "yahtzee",
  title: "Yahtzee-style",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "13 rounds of 5-dice scoring across categories.",
  howToPlay: `Fill all 13 scoring categories over 13 rounds to maximise your total. Each round you roll 5 dice up to 3 times, then assign the result to exactly one unused category.

Click "Roll" to roll all 5 dice. Click any die to lock (keep) it, then roll again to reroll the rest. After 1–3 rolls, click an empty category to score it. Upper section (Ones through Sixes) scores the sum of matching faces. Lower section: Three/Four of a Kind scores the sum of all dice; Full House scores 25; Small Straight 30; Large Straight 40; Yahtzee 50; Chance scores the total of all dice. You must fill every category once — placing zeros in categories you can't satisfy is sometimes necessary. With Strict Yahtzee Bonus enabled, rolling a Yahtzee when the Yahtzee category is already scored (with 50) adds 100 bonus points to whatever category you choose.

Scoring: final score = sum of all 13 categories + 35-point upper bonus if your upper section totals 63 or more. A perfect game is 375 (or 1575 with bonus Yahtzees).

Tips: aim for 63+ in the upper section early. Save Chance for rounds where no other category fits.`,
  settings: yahtzeeSettings,
  initialState: (seed: number, settings: YahtzeeSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: YahtzeeState): HintTarget | null => {
    if (isTerminal(state)) return null;
    // If rolls remain (and we've rolled at least once or not at all), pulse Roll
    if (state.rollsUsed < 3) {
      return { selector: '[data-testid="hint-target-yahtzee-roll"]', pulses: 3 };
    }
    // Out of rolls: pulse the best-scoring unused category
    const unused = ALL_CATEGORIES.filter((c) => !(c in state.scores)) as Category[];
    if (unused.length === 0) return null;
    let bestCat = unused[0]!;
    let bestScore = computeCategoryScore(state.dice, bestCat);
    for (const c of unused) {
      const s = computeCategoryScore(state.dice, c);
      if (s > bestScore) { bestScore = s; bestCat = c; }
    }
    return { selector: `[data-testid="hint-target-yahtzee-cat-${bestCat}"]`, pulses: 3 };
  },
  component: Yahtzee,
  themeOverrides: {
    // Warm wooden tabletop — dice games feel right on a stained-pine surface
    // rather than a card felt. Scoped to this plugin only.
    feltGradient: "linear-gradient(135deg, #6b3f1a, #8a5a2b 50%, #4a2810)",
    accent: "rgba(217, 119, 6, 0.45)",
  },
};
