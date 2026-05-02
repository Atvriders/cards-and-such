import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { Mi6QuizState, Mi6QuizAction, Mi6QuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Mi6QuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const mi6QuizPlugin: GamePlugin<Mi6QuizState, Mi6QuizAction, typeof settings> = {
  id:"mi6-quiz", title:"MI6 History Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of Britain's Secret Intelligence Service (MI6).",
  howToPlay:"MI6 History Quiz tests your knowledge of the United Kingdom's Secret Intelligence Service. Founded in 1909 as the Foreign Section of the Secret Service Bureau, MI6 (now called SIS) is responsible for foreign human intelligence and covert action overseas, while MI5 handles domestic security.\n\nQuestions cover Mansfield Smith-Cumming and the original \"C\", the Vauxhall Cross headquarters, the Cambridge Five betrayals, World War II operations like Double Cross, Cold War triumphs and disasters, and famous officers like Stewart Menzies, Maurice Oldfield and Richard Dearlove.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly. Wrong answers earn zero. Tap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Choose 10 or 20 questions in Settings.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as Mi6QuizSettings),
  reducer,isTerminal,
  hint: (state: Mi6QuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:Mi6QuizGame,
};
