import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceSkipBetState, DiceSkipBetAction, DiceSkipBetSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceSkipBet } from "./Game.js";
const settings = { rounds: { kind:"enum" as const, label:"Rounds", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const diceSkipBetPlugin: GamePlugin<DiceSkipBetState, DiceSkipBetAction, typeof settings> = {
  id: "dice-skip-bet", title: "Dice Skip Bet", category: "dice",
  players: { min:1, max:1, multiplayer:false },
  description: "Pick a 'skip' number — if the die rolls it you lose 5× your bet, but any other roll wins your bet back.",
  howToPlay: `Dice Skip Bet is a high-risk dice game with asymmetric odds. Each round you choose a skip number (1 through 6) and a bet amount. Roll the die — if it lands on anything other than your skip, you win your bet. But if it lands on your skip number, you lose five times your bet.

The math: you win with probability 5/6, but lose 5× when you hit (1/6 chance). The expected value per round is actually zero — it is a fair game that can swing wildly.

Choosing rarer numbers provides no statistical edge, but you can manage risk by betting small amounts. Start with 100 coins and try to end with more than you started.

Play 10 or 20 rounds. If you hit your skip on a big bet, it will sting — so keep bet sizes reasonable!`,
  settings,
  initialState: (seed:number, s:S) => initialState(seed, s as DiceSkipBetSettings),
  reducer, isTerminal, component: DiceSkipBet,
};
