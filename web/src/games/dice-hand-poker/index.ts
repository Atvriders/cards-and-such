import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceHandPokerState, DiceHandPokerAction, DiceHandPokerSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceHandPokerGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceHandPokerPlugin: GamePlugin<DiceHandPokerState, DiceHandPokerAction, typeof settings> = {
  id:"dice-hand-poker", title:"Dice Hand Poker", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Roll 5 dice up to 3 times; rate your final hand as poker. 6 rounds.",
  howToPlay:`Dice Hand Poker is a Yahtzee-flavored dice mini that rewards smart re-rolls. Each round you press Roll to fling five dice. After the first roll, you can tap any die to "hold" it (it'll glow gold), then press Re-roll to re-roll the rest. You get up to three rolls total per round.

When you're out of rolls, your final five dice are scored as a poker hand. Five of a kind is worth a massive 600; four of a kind is 300; a full house (a triple plus a pair) is 200; a straight (1-2-3-4-5 or 2-3-4-5-6) is 150; three of a kind is 100; two pair is 60; one pair is 30; and high card is 0.

Six rounds in all. Strategic decisions matter: when do you keep a strong start, and when do you gamble for a better combination? Skilled players will average around 600-900 points per game, while a hot run with multiple full houses can push well above. Roll 'em!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceHandPokerSettings),
  reducer,isTerminal,
  hint: (state: DiceHandPokerState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (state.phase === "scored") {
      return { selector: '[data-testid="hint-target-dice-hand-poker-next"]', pulses: 3 };
    }
    if (state.rollsLeft > 0) {
      return { selector: '[data-testid="hint-target-dice-hand-poker-roll"]', pulses: 3 };
    }
    return null;
  },
  component:DiceHandPokerGame,
};
