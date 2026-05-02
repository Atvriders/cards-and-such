import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { RollAndWriteProState, RollAndWriteProAction, Category } from "./state.js";
import { initialState, reducer, isTerminal, scoreCategory } from "./state.js";
import { RollAndWritePro } from "./RollAndWritePro.js";

const RAW_PRO_CATS: Category[] = [
  "ones", "twos", "threes", "fours", "fives", "sixes",
  "threeOfAKind", "fourOfAKind", "fullHouse", "smallStraight", "largeStraight", "yahtzee", "chance",
];

export const rollAndWriteProSettings = {
  rounds: {
    kind: "enum" as const,
    label: "Rounds",
    options: ["8", "10", "12"] as const,
    default: "10",
  },
} as const;

type RollAndWriteProSettingsType = SettingsOf<typeof rollAndWriteProSettings>;

export const rollAndWriteProPlugin: GamePlugin<RollAndWriteProState, RollAndWriteProAction, typeof rollAndWriteProSettings> = {
  id: "roll-and-write-pro",
  title: "Roll & Write Pro",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Yahtzee-style scorecard game: roll five dice and fill 13 categories for maximum points.",
  howToPlay: `Roll and Write Pro is a Yahtzee-style dice game where you fill in a scorecard over multiple rounds. Each round you roll five dice, choose which to keep, re-roll up to two more times, then assign the final dice to one of 13 scoring categories.

Click any die to keep it (turns gold) before re-rolling. You get two re-rolls per round. After your rolls, click Score next to any unfilled category to lock in that result.

Categories: Ones through Sixes score the sum of matching faces. Three of a Kind and Four of a Kind score the total of all dice if the condition is met. Full House (three of one + two of another) scores 25. Small Straight (four consecutive values) scores 30. Large Straight (all five consecutive) scores 40. Yahtzee (all five matching) scores 50. Chance scores the plain total of all dice.

Strategy: prioritize categories that match your current dice before re-rolling. Lock in Yahtzee or straights opportunistically — they are rare and worth the most points.

Settings: Rounds controls game length. More rounds let you fill more scorecard rows and achieve higher totals. Score is normalised to 100 based on the theoretical maximum.`,
  settings: rollAndWriteProSettings,
  initialState: (seed: number, settings: RollAndWriteProSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: RollAndWriteProState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.rollsLeft > 0) {
      return { selector: '[data-testid="hint-target-roll-and-write-pro-roll"]', pulses: 3 };
    }
    const unused = RAW_PRO_CATS.filter((c) => state.scores[c] === null);
    if (unused.length === 0) return null;
    let bestCat = unused[0]!;
    let bestScore = scoreCategory(bestCat, state.dice);
    for (const c of unused) {
      const s = scoreCategory(c, state.dice);
      if (s > bestScore) { bestScore = s; bestCat = c; }
    }
    return { selector: `[data-testid="hint-target-roll-and-write-pro-cat-${bestCat}"]`, pulses: 3 };
  },
  component: RollAndWritePro,
};
