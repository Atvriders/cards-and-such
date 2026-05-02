import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { UnsolvedMysteriesQuizState, UnsolvedMysteriesQuizAction, UnsolvedMysteriesQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { UnsolvedMysteriesQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const unsolvedMysteriesQuizPlugin: GamePlugin<UnsolvedMysteriesQuizState, UnsolvedMysteriesQuizAction, typeof settings> = {
  id:"unsolved-mysteries-quiz", title:"Unsolved Mysteries Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of famous unsolved historical mysteries.",
  howToPlay:"Unsolved Mysteries Quiz covers history's most tantalizing cold cases and unexplained events: from D.B. Cooper's leap to Jack the Ripper's identity, from the Dyatlov Pass to the Voynich Manuscript, from the Bermuda Triangle to the Zodiac Killer. These questions explore what we know, and what we still don't.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on.\n\nChoose 10, 20, or 30 questions in Settings. True-crime enthusiasts and curious skeptics will both find plenty here to ponder.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as UnsolvedMysteriesQuizSettings),
  reducer,isTerminal,
  hint: (state: UnsolvedMysteriesQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:UnsolvedMysteriesQuizGame,
};
