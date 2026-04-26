import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceAddBetState, DiceAddBetAction, DiceAddBetSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceAddBet } from "./Game.js";
const settings = { rounds: { kind:"enum" as const, label:"Rounds", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const diceAddBetPlugin: GamePlugin<DiceAddBetState, DiceAddBetAction, typeof settings> = {
  id: "dice-add-bet", title: "Dice Add Bet", category: "dice",
  players: { min:1, max:1, multiplayer:false },
  description: "Roll 3 dice and bet whether their sum will be High (above 10) or Low (10 or under).",
  howToPlay: `Dice Add Bet is a Hi-Lo betting game with three dice. Before each roll, choose a wager amount and predict whether the sum of three d6 dice will be High (11 to 18) or Low (3 to 10).

Three dice sum to between 3 and 18 with 10.5 as the middle point. The odds are nearly even — 108 of 216 combinations produce a sum of 11 or higher, and 108 produce 10 or lower.

Start with 100 coins. Choose your bet and side, then the dice roll. Win and your coins increase by your bet; lose and they decrease. The game ends after all rounds or when you run out of coins.

Use Settings to choose 10 or 20 rounds. Manage your bankroll carefully — large bets can be thrilling but also devastating. Can you grow your stake?`,
  settings,
  initialState: (seed:number, s:S) => initialState(seed, s as DiceAddBetSettings),
  reducer, isTerminal, component: DiceAddBet,
};
