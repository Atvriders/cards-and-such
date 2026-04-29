import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { Fibbage2QuizState, Fibbage2QuizAction, Fibbage2QuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Fibbage2QuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const fibbage2QuizPlugin: GamePlugin<Fibbage2QuizState, Fibbage2QuizAction, typeof settings> = {
  id:"fibbage-2-quiz", title:"Fibbage 2 Trivia", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trivia about Jackbox's bluff-trivia sequel Fibbage 2 with the Defibrillator.",
  howToPlay:"Fibbage 2 Trivia tests your knowledge of the bluff-trivia sequel from Jackbox Games — the entry that introduced categorized questions and the 'Defibrillator' lifeline that lets you remove a wrong answer. Questions cover its Pack number, mechanics, scoring, supported players, and publisher. Each round has ten questions. Tap your answer and press Submit. A correct answer awards 100 base points plus 10 points per second remaining on the 15-second timer, so quick play scores better. A wrong answer reveals the correct option and locks the round; press Next to continue. After ten questions, your final score is shown. If you have ever tried to write a fake answer so plausible that even the truth looked silly, you'll feel right at home in this quiz, which celebrates the beloved party game that introduced phone-controller bluffing to living rooms everywhere.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as Fibbage2QuizSettings),
  reducer,isTerminal,component:Fibbage2QuizGame,
};
