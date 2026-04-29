import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { LoadedQuestionsQuizState, LoadedQuestionsQuizAction, LoadedQuestionsQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { LoadedQuestionsQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const loadedQuestionsQuizPlugin: GamePlugin<LoadedQuestionsQuizState, LoadedQuestionsQuizAction, typeof settings> = {
  id:"loaded-questions-quiz", title:"Loaded Questions Trivia", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trivia about Loaded Questions, the secretly-answer-and-guess party game.",
  howToPlay:"Loaded Questions Trivia is meta-trivia about the long-running party game where players answer hypothetical questions secretly and a guesser tries to match the answers to the players who wrote them. Topics span the publisher, the categories, the recommended players, the travel-friendly On The Go variant, and the scoring rules. Each round delivers ten questions. Tap an answer and press Submit. A correct answer earns 100 base points plus 10 points per second remaining on the 15-second timer — fast picks reward more. Wrong answers reveal the correct option and disable further input; press Next to advance. After question ten, your final score appears. Whether you've matched your spouse's hypothetical road-trip song or watched a coworker accidentally reveal more than they intended, this quiz proves how well you know the rules behind those revealing questions.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as LoadedQuestionsQuizSettings),
  reducer,isTerminal,component:LoadedQuestionsQuizGame,
};
