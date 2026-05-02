import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ProgrammingLangsQuizState, ProgrammingLangsQuizAction, ProgrammingLangsQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ProgrammingLangsQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const programmingLangsQuizPlugin: GamePlugin<ProgrammingLangsQuizState, ProgrammingLangsQuizAction, typeof settings> = {
  id:"programming-langs-quiz", title:"Programming Languages Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of C, Python, JavaScript, and the history of programming languages.",
  howToPlay:"Programming Languages Quiz challenges you on the languages that shaped software: classic systems languages like C and assembly, the OOP era of C++ and Java, scripting languages like Python and JavaScript, functional languages like Haskell and Lisp, and modern arrivals like Rust and Go. Questions cover famous designers, paradigms, and trivia like 'who created Python?'\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock \u2014 fast, accurate answers earn the highest score. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on.\n\nChoose 10, 20, or 30 questions in Settings. Whether you're a polyglot programmer or just learning to code, this quiz will deepen your appreciation of the rich history of programming languages!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as ProgrammingLangsQuizSettings),
  reducer,isTerminal,
  hint: (state: ProgrammingLangsQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:ProgrammingLangsQuizGame,
};
