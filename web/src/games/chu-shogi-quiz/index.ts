import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ChuShogiState, ChuShogiAction, ChuShogiSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ChuShogiGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const chuShogiPlugin: GamePlugin<ChuShogiState, ChuShogiAction, typeof settings> = {
  id:"chu-shogi-quiz", title:"Chu Shogi Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of Chu Shogi, the medieval 12x12 Shogi giant.",
  howToPlay:"Chu Shogi ('middle Shogi') is a medieval Japanese variant of Shogi played on a 12x12 board with 46 pieces per side. Among its many unique pieces is the famous Lion, a piece capable of double moves and powerful captures. Chu Shogi was historically the most popular Shogi variant before standard 9x9 Shogi displaced it; today it survives as a niche game played by specialists. A modern game can take many hours.\n\nThis is a 10-question multiple-choice quiz. Each question gives you 15 seconds to answer. Tap one of the four choices, then press Submit to lock in your answer.\n\nYou earn 100 base points for every correct answer plus 10 points for each second remaining on the clock — quick correct answers are worth far more than slow ones. Wrong answers earn nothing.\n\nAfter you submit, the correct answer is revealed: green for correct, red for wrong. Press Next to continue. The game ends after all 10 questions.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as ChuShogiSettings),
  reducer,isTerminal,component:ChuShogiGame,
};
