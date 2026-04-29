import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { LoadedQuestionsGoQuizState, LoadedQuestionsGoQuizAction, LoadedQuestionsGoQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { LoadedQuestionsGoQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const loadedQuestionsGoQuizPlugin: GamePlugin<LoadedQuestionsGoQuizState, LoadedQuestionsGoQuizAction, typeof settings> = {
  id:"loaded-questions-go-quiz", title:"Loaded Questions On The Go Trivia", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trivia about Loaded Questions On The Go, the travel card edition of Loaded Questions.",
  howToPlay:"Loaded Questions On The Go Trivia is a ten-question quiz about the streamlined card-only travel version of the popular Loaded Questions party game, where players write answers to a question and the active player must guess which answer came from which friend. Each round tests your knowledge of the smaller card box, the way questions are categorised, scoring without a board, and how it differs from the boxed parent game. Tap your answer and press Submit. A correct answer awards 100 base points plus 10 per second remaining on the 15-second timer. A wrong answer reveals the correct option and locks the round; press Next to continue. After ten questions, your final score appears. Loaded Questions On The Go is praised for keeping the social heart of the original — funny insights into how friends think — while shaving away the board for portability. Test how well you remember its design.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as LoadedQuestionsGoQuizSettings),
  reducer,isTerminal,component:LoadedQuestionsGoQuizGame,
};
