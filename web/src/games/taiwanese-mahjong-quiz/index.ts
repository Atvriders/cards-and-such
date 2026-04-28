import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TaiwaneseMahjongState, TaiwaneseMahjongAction, TaiwaneseMahjongSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TaiwaneseMahjongGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const taiwaneseMahjongPlugin: GamePlugin<TaiwaneseMahjongState, TaiwaneseMahjongAction, typeof settings> = {
  id:"taiwanese-mahjong-quiz", title:"Taiwanese Mahjong Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of Taiwanese 16-tile Mahjong.",
  howToPlay:"Taiwanese Mahjong is a regional Mahjong tradition played mostly in Taiwan, distinguished from other Chinese variants by its 16-tile final hand instead of the more common 13/14-tile hand. Players draw and discard until forming five sets and a pair (16 tiles). Taiwanese Mahjong uses flower tiles, special bonuses for 'heavenly hand' and 'earthly hand', and a unique scoring schema with smaller fixed payouts and bigger limit hands.\n\nThis is a 10-question multiple-choice quiz. Each question gives you 15 seconds to answer. Tap one of the four choices, then press Submit to lock in your answer.\n\nYou earn 100 base points for every correct answer plus 10 points for each second remaining on the clock — quick correct answers are worth far more than slow ones. Wrong answers earn nothing.\n\nAfter you submit, the correct answer is revealed: green for correct, red for wrong. Press Next to continue. The game ends after all 10 questions.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as TaiwaneseMahjongSettings),
  reducer,isTerminal,component:TaiwaneseMahjongGame,
};
