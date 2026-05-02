import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ZhengShangyouQuizState, ZhengShangyouQuizAction, ZhengShangyouQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ZhengShangyouQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const zhengShangyouQuizPlugin: GamePlugin<ZhengShangyouQuizState, ZhengShangyouQuizAction, typeof settings> = {
  id:"zheng-shangyou-quiz", title:"Zheng Shangyou Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of the Chinese climbing game Zheng Shangyou.",
  howToPlay:"Zheng Shangyou, meaning 'struggle upstream', is a Chinese climbing card game in which players race to empty their hands using pairs, triples, runs, and bombs. It is closely related to other shedding games like Big Two and President.\n\nThis is a 10-question multiple-choice quiz. Each question gives you 15 seconds to answer. Tap one of the four lettered choices, then press Submit to lock in your answer.\n\nYou earn 100 base points for every correct answer plus 10 points for each second remaining on the clock — quick correct answers are worth far more than slow ones. Wrong answers earn nothing, and if you let the timer run out, the question is marked wrong automatically.\n\nAfter you submit, the correct answer is revealed in green and an incorrect choice in red. Press Next to move on to the next question. The quiz ends after all 10 questions and your final score and number of correct answers are shown. Try to beat your best score on subsequent runs.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as ZhengShangyouQuizSettings),
  reducer,isTerminal,
  hint: (state: ZhengShangyouQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:ZhengShangyouQuizGame,
};
