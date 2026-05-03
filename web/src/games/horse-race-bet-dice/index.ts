import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { HorseRaceBetDiceState, HorseRaceBetDiceAction, HorseRaceBetDiceSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { HorseRaceBetDiceGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const horseRaceBetDicePlugin: GamePlugin<HorseRaceBetDiceState, HorseRaceBetDiceAction, typeof settings> = {
  id:"horse-race-bet-dice", title:"Horse Race Bet", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trivia about Horse Race, a betting dice game with horses 2-12.",
  howToPlay:"Horse Race Bet Trivia is a ten-question quiz about Horse Race, a casual party-style dice game where the numbers 2 through 12 represent horses. Players bet (with chips, candy, or pennies) on which horse will reach the finish line first. Two dice are rolled repeatedly; the sum advances the matching horse one step. Because 7 is the most likely sum (1/6 chance), it's also typically given the longest track. Other horses have shorter tracks proportional to their probability. The first horse to reach the end wins, and players holding bets on that horse cash in. Each question tests rules, probability, and history of Horse Race. Tap an answer and Submit; correct answers earn 100 base points plus 10 per second remaining on the 15-second timer. Wrong answers reveal the correct option. After ten questions your final score is shown.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as HorseRaceBetDiceSettings),
  reducer,isTerminal,
  hint: (state: HorseRaceBetDiceState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "result") return { selector: '[data-testid="hint-target-horse-race-bet-dice-next"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-horse-race-bet-dice-submit"]', pulses: 3 };
  },
  component:HorseRaceBetDiceGame,
};
