import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SingaporeMahjongState, SingaporeMahjongAction, SingaporeMahjongSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SingaporeMahjongGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const singaporeMahjongPlugin: GamePlugin<SingaporeMahjongState, SingaporeMahjongAction, typeof settings> = {
  id:"singapore-mahjong-quiz", title:"Singapore Mahjong Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of Singapore-style Mahjong rules.",
  howToPlay:"Singapore Mahjong is a regional variant adapted from Cantonese rules with characteristic Singapore touches — most notably the prominence of flower tiles (a player who draws the matching seasonal/flower for their seat earns immediate bonus points) and bonus combinations like 'heavenly hand' and 'earthly hand'. Singapore Mahjong tables typically use the 144-tile set including 8 flowers and seasons, and several house rules govern animals and special hands.\n\nThis is a 10-question multiple-choice quiz. Each question gives you 15 seconds to answer. Tap one of the four choices, then press Submit to lock in your answer.\n\nYou earn 100 base points for every correct answer plus 10 points for each second remaining on the clock — quick correct answers are worth far more than slow ones. Wrong answers earn nothing.\n\nAfter you submit, the correct answer is revealed: green for correct, red for wrong. Press Next to continue. The game ends after all 10 questions.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as SingaporeMahjongSettings),
  reducer,isTerminal,component:SingaporeMahjongGame,
};
