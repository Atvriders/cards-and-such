import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MiniYahtzeeState, MiniYahtzeeAction, MiniYahtzeeSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MiniYahtzeeGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const miniYahtzeePlugin: GamePlugin<MiniYahtzeeState, MiniYahtzeeAction, typeof settings> = {
  id:"mini-yahtzee", title:"Mini Yahtzee", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"One Yahtzee scorecard, 13 categories. Roll, hold, score.",
  howToPlay:`Mini Yahtzee is a single-pass version of the classic dice game. You have five dice and 13 scoring categories: Ones through Sixes (count and sum the matching dice), 3 of a Kind, 4 of a Kind (sum of all five dice if you have the qualifying group), Full House (25), Small Straight (30), Large Straight (40), Yahtzee/five-of-a-kind (50), and Chance (sum of all dice).

Each turn: tap Roll to roll all unheld dice. Tap any die to hold it (turns green). You get up to three rolls per turn. After rolling, place the result into one open category — partial scores show in parentheses for uncategorized slots based on your current dice. Place wisely!

Total possible score reaches 200+ with luck. Aim to fill upper section (Ones-Sixes) for at least 63 points; chase the Yahtzee bonus on lucky early rolls. The game ends when all 13 categories are filled. Strategic placement separates novices from veterans.`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as MiniYahtzeeSettings),
  reducer,isTerminal,component:MiniYahtzeeGame,
};
