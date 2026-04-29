import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TienLenQuizState, TienLenQuizAction, TienLenQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TienLenQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const tienLenQuizPlugin: GamePlugin<TienLenQuizState, TienLenQuizAction, typeof settings> = {
  id:"tien-len-quiz", title:"Tien Len Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of the Vietnamese shedding game Tien Len.",
  howToPlay:"Tien Len, also called Vietnamese Thirteen, is one of the most popular shedding games in Southeast Asia. Players try to be the first to empty their hand using singles, pairs, triples, runs, and bombs. The 3 of Spades leads the first round, and 2s are the highest-ranked cards.\n\nThis is a 10-question multiple-choice quiz. Each question gives you 15 seconds to answer. Tap one of the four lettered choices, then press Submit to lock in your answer.\n\nYou earn 100 base points for every correct answer plus 10 points for each second remaining on the clock — quick correct answers are worth far more than slow ones. Wrong answers earn nothing, and if you let the timer run out, the question is marked wrong automatically.\n\nAfter you submit, the correct answer is revealed in green and an incorrect choice in red. Press Next to move on to the next question. The quiz ends after all 10 questions and your final score and number of correct answers are shown. Try to beat your best score on subsequent runs.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as TienLenQuizSettings),
  reducer,isTerminal,component:TienLenQuizGame,
};
