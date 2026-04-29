import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TsuroQuizState, TsuroQuizAction, TsuroQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TsuroQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const tsuroQuizPlugin: GamePlugin<TsuroQuizState, TsuroQuizAction, typeof settings> = {
  id:"tsuro-quiz", title:"Tsuro Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of the path-laying tile game Tsuro.",
  howToPlay:"Tsuro is a tile-laying game where players move dragon stones along paths they construct. The goal is to keep your stone on the board while forcing opponents off the edge.\n\nThis is a 10-question multiple-choice quiz. Each question gives you 15 seconds to answer. Tap one of the four lettered choices, then press Submit to lock in your answer.\n\nYou earn 100 base points for every correct answer plus 10 points for each second remaining on the clock — quick correct answers are worth far more than slow ones. Wrong answers earn nothing, and if you let the timer run out, the question is marked wrong automatically.\n\nAfter you submit, the correct answer is revealed in green and an incorrect choice in red. Press Next to move on to the next question. The quiz ends after all 10 questions and your final score and number of correct answers are shown. Try to beat your best score on subsequent runs.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as TsuroQuizSettings),
  reducer,isTerminal,component:TsuroQuizGame,
};
