import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { YachtState, YachtAction, YachtCategory } from "./state.js";
import { initialState, reducer, isTerminal, ALL_YACHT_CATEGORIES, computeYachtScore } from "./state.js";
import { Yacht } from "./Yacht.js";

export const yachtSettings = {
  dummy: { kind: "boolean" as const, label: "Standard Rules", default: true },
} as const;

type YachtSettingsType = SettingsOf<typeof yachtSettings>;

export const yachtPlugin: GamePlugin<YachtState, YachtAction, typeof yachtSettings> = {
  id: "yacht",
  title: "Yacht",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Old-school 5-dice scoring game — 12 categories, no bonuses.",
  howToPlay: `Yacht is the original 5-dice scoring game, predecessor to Yahtzee. Fill all 12 categories over 12 rounds to maximise your total score. Each round you roll 5 dice up to 3 times, then assign the result to exactly one unused category.

Click "Roll Dice" to roll all 5 dice. Click any die to lock it, then "Re-roll" to reroll the rest. After 1–3 rolls, click an empty category to score it.

The 12 categories: Ones through Sixes score the sum of matching faces. Little Straight (1-2-3-4-5) and Big Straight (2-3-4-5-6) each score 30 points. Four of a Kind scores the sum of all 5 dice if 4+ share a face. Full House scores the sum of all 5 dice if they show 3+2 of different faces. Choice scores the sum of all dice. Yacht (5 of a kind) scores 50 points.

Unlike Yahtzee, Yacht has no upper section bonus and no Yahtzee bonus — just 12 clean categories. Scoring zero in a category is sometimes necessary; use Choice wisely as a fallback.

Tips: target the high-value fixed categories (straights, Yacht) early. Save Choice for a round when nothing else fits.`,
  settings: yachtSettings,
  initialState: (seed: number, settings: YachtSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: YachtState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.rollsUsed < 3) {
      return { selector: '[data-testid="hint-target-yacht-roll"]', pulses: 3 };
    }
    const unused = ALL_YACHT_CATEGORIES.filter((c) => !(c in state.scores)) as YachtCategory[];
    if (unused.length === 0) return null;
    let bestCat = unused[0]!;
    let bestScore = computeYachtScore(state.dice, bestCat);
    for (const c of unused) {
      const s = computeYachtScore(state.dice, c);
      if (s > bestScore) { bestScore = s; bestCat = c; }
    }
    return { selector: `[data-testid="hint-target-yacht-cat-${bestCat}"]`, pulses: 3 };
  },
  component: Yacht,
};
