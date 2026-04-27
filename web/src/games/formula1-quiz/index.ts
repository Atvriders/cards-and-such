import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { Formula1QuizState, Formula1QuizAction, Formula1QuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Formula1QuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const formula1QuizPlugin: GamePlugin<Formula1QuizState, Formula1QuizAction, typeof settings> = {
  id:"formula1-quiz", title:"Formula 1 Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"F1 history: champions, circuits, technology.",
  howToPlay:"Formula 1 Quiz tests your knowledge with 10 to 30 multiple-choice questions drawn from a curated pool. Topics range from key facts and dates to people, places, traditions, and trivia.\n\nYou have 15 seconds to answer each question. Tap A, B, C, or D to lock in your choice, then press Submit. A correct answer scores 100 base points plus 10 points for every second left on the clock — so quick recall pays off. Wrong answers earn nothing, and the correct answer is always revealed before you continue.\n\nUse the Settings panel to choose 10, 20, or 30 questions. The pool is shuffled per game session, so two runs with the same topic still feel fresh. Choices within each question are also reordered to keep you on your toes.\n\nThere are no penalties beyond zero — guess if you must, since wrong is no worse than blank. Aim for accuracy first, speed second. Strong runs land in the 1500-3000 point range; perfect, lightning-fast runs can crack 4000+. Good luck!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as Formula1QuizSettings),
  reducer,isTerminal,component:Formula1QuizGame,
};
