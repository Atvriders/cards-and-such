import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TwentyFiveCardState, TwentyFiveCardAction, TwentyFiveCardSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TwentyFiveCardGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const twentyFiveCardPlugin: GamePlugin<TwentyFiveCardState, TwentyFiveCardAction, typeof settings> = {
  id:"twenty-five-card", title:"Twenty-Five", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trivia about Twenty-Five, the national card game of Ireland.",
  howToPlay:"Twenty-Five Trivia is a ten-question quiz about Twenty-Five, the national card game of Ireland and a member of the Spoil Five family. Played by 2-9 players (four or five is best) with a standard 52-card deck, each player is dealt five cards and the dealer turns up the next for trump. Trick-taking begins; the first player to score 25 points wins. Notable rules include a unique trump-ranking where the Five and Jack of trumps are highest, the Ace of Hearts is always third-highest trump regardless of trump suit, and reneging is allowed for high trumps. Each question tests rules, scoring, history, and tactics of Twenty-Five. Tap an answer and Submit; correct answers earn 100 base points plus 10 per second remaining on the 15-second timer. Wrong answers reveal the correct option. After ten questions your final score is shown. Twenty-Five is a delightful, idiosyncratic Irish classic.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as TwentyFiveCardSettings),
  reducer,isTerminal,component:TwentyFiveCardGame,
};
