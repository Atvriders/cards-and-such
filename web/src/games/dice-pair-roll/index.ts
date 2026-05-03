import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DicePairRollState, DicePairRollAction, DicePairRollSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DicePairRoll } from "./Game.js";
const settings = { rounds: { kind:"enum" as const, label:"Rounds", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const dicePairRollPlugin: GamePlugin<DicePairRollState, DicePairRollAction, typeof settings> = {
  id: "dice-pair-roll", title: "Dice Pair Roll", category: "dice",
  players: { min:1, max:1, multiplayer:false },
  description: "Roll two dice and score the sum. Roll doubles to double your points for that round!",
  howToPlay: `Dice Pair Roll is a quick two-dice mini-game. Each round you roll two standard six-sided dice. Your score for that round equals the sum of both dice — so results range from 2 to 12.

But there is a bonus: roll doubles (both dice showing the same face) and your score for that round is doubled! Rolling double-sixes scores 24 points instead of 12. Even double-ones score 4 instead of 2.

There are no decisions to make — just press Roll Dice and enjoy the results. Over 10 or 20 rounds, your cumulative total is your final score.

The expected value per roll is 7 without doubles and about 8.5 counting the doubles bonus. Can you beat the average? Use Settings to choose the number of rounds!`,
  settings,
  initialState: (seed:number, s:S) => initialState(seed, s as DicePairRollSettings),
  reducer, isTerminal, 
  hint: (state: any) => {
    if ((state as any).phase === "gameover" || (state as any).gameOver) return null;
    if ((state as any).phase === "result") return { selector: '[data-testid="hint-target-dice-pair-roll-next"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-dice-pair-roll-roll"]', pulses: 3 };
  },
  component: DicePairRoll,
};
