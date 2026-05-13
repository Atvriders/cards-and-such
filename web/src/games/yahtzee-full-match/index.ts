import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type {
  YahtzeeFullMatchState,
  YahtzeeFullMatchAction,
  Category,
} from "./state.js";
import {
  initialState,
  reducer,
  isTerminal,
  unusedCategories,
  computeCategoryScore,
} from "./state.js";

const YahtzeeFullMatch = /* @__PURE__ */ lazy(() =>
  import("./Game.js").then((m) => ({
    default: m.YahtzeeFullMatchGame as unknown as React.ComponentType<unknown>,
  })),
);

const yahtzeeFullMatchSettings = {
  _dummy: {
    kind: "boolean" as const,
    label: "Unused",
    default: false,
  },
} as const;

type YahtzeeFullMatchSettingsType = SettingsOf<typeof yahtzeeFullMatchSettings>;

export const yahtzeeFullMatchPlugin: GamePlugin<
  YahtzeeFullMatchState,
  YahtzeeFullMatchAction,
  typeof yahtzeeFullMatchSettings
> = {
  id: "yahtzee-full-match",
  title: "Yahtzee (Full Scorecard Match)",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description:
    "The complete 13-category scorecard with bonus, full chance, and joker rules.",
  howToPlay: `Yahtzee is played by rolling five six-sided dice and scoring the result on a 13-row scorecard. You and a CPU opponent each fill the same scorecard side-by-side. Highest grand total wins the match.

Each turn you may roll up to three times. After the first roll, click any die to hold (lock) it; click again to release. Then click "Re-roll" to roll the unheld dice. When you have rolled (1–3 times), click any unused row to score the dice into that category.

Upper section (Aces through Sixes): score the sum of dice showing that face. If your six upper-section boxes total 63 or more, you earn a +35 upper-section bonus. Lower section: 3 of a Kind and 4 of a Kind score the sum of all five dice if you have at least three (or four) of any face. Full House (one triple + one pair) scores 25. Small Straight (four consecutive faces) scores 30. Large Straight (all five consecutive) scores 40. YAHTZEE (five of a kind) scores 50. Chance scores the sum of all five dice — useful as a fallback.

Yahtzee bonus chip: every additional Yahtzee you roll AFTER your Yahtzee box has already been filled with 50 earns a +100 bonus chip added to your grand total — no upper limit.

Joker rule: when you roll a bonus Yahtzee but the matching upper-section box is already filled (e.g. a Yahtzee of fives when Fives is taken), Full House, Small Straight, and Large Straight may auto-score their fixed values (25, 30, 40) if you choose them — even though the dice technically aren't a full house or a straight.

CPU strategy: the CPU uses a greedy heuristic — it holds the most common face, rerolls twice, then picks the open category that yields the most points while leaving rarely-attainable rows (Yahtzee, Large Straight) for higher-value rolls.

Grand total = sum of all 13 rows + upper bonus (if any) + Yahtzee bonus chips. Beat the CPU to claim the leaderboard win bonus.`,
  settings: yahtzeeFullMatchSettings,
  initialState: (seed: number, settings: YahtzeeFullMatchSettingsType) =>
    initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: YahtzeeFullMatchState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.turn !== "player") return null;
    if (state.phase === "rolling" && state.rollsUsed < 3) {
      return {
        selector: '[data-testid="hint-target-yahtzee-full-match-roll"]',
        pulses: 3,
      };
    }
    // Scoring phase — find the best unused category.
    const unused = unusedCategories(state.player);
    if (unused.length === 0) return null;
    let bestCat: Category = unused[0]!;
    let bestVal = -1;
    for (const c of unused) {
      const v = computeCategoryScore(state.dice, c, state.player);
      if (v > bestVal) {
        bestVal = v;
        bestCat = c;
      }
    }
    return {
      selector: `[data-testid="hint-target-yahtzee-full-match-cat-${bestCat}"]`,
      pulses: 3,
    };
  },
  component: YahtzeeFullMatch,
  themeOverrides: {
    feltGradient: "linear-gradient(135deg, #6b3f1a, #8a5a2b 50%, #4a2810)",
    accent: "rgba(217, 119, 6, 0.45)",
  },
};
