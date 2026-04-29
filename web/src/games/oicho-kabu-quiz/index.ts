import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { OichoKabuQuizState, OichoKabuQuizAction, OichoKabuQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { OichoKabuQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const oichoKabuQuizPlugin: GamePlugin<OichoKabuQuizState, OichoKabuQuizAction, typeof settings> = {
  id:"oicho-kabu-quiz", title:"Oicho Kabu Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of the Japanese gambling card game Oicho Kabu.",
  howToPlay:"Oicho Kabu is a traditional Japanese gambling card game played with the Kabufuda deck. The objective is similar to baccarat: get a hand whose total ends as close to 9 as possible. The name 'kabu' means 'nine'.\n\nThis is a 10-question multiple-choice quiz. Each question gives you 15 seconds to answer. Tap one of the four lettered choices, then press Submit to lock in your answer.\n\nYou earn 100 base points for every correct answer plus 10 points for each second remaining on the clock — quick correct answers are worth far more than slow ones. Wrong answers earn nothing, and if you let the timer run out, the question is marked wrong automatically.\n\nAfter you submit, the correct answer is revealed in green and an incorrect choice in red. Press Next to move on to the next question. The quiz ends after all 10 questions and your final score and number of correct answers are shown. Try to beat your best score on subsequent runs.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as OichoKabuQuizSettings),
  reducer,isTerminal,component:OichoKabuQuizGame,
};
