import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ManBookerQuizState, ManBookerQuizAction, ManBookerQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ManBookerQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const manBookerQuizPlugin: GamePlugin<ManBookerQuizState, ManBookerQuizAction, typeof settings> = {
  id:"man-booker-quiz", title:"Booker Prize Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of the Booker Prize for Fiction.",
  howToPlay:"Booker Prize Quiz tests your knowledge of one of the world's most prestigious literary awards. The Booker Prize for Fiction (formerly the Man Booker Prize) has been awarded annually since 1969 to the best novel in English published in the UK or Ireland.\n\nQuestions cover Booker winners across decades — Salman Rushdie's Midnight's Children, the Booker of Bookers, Hilary Mantel's record two wins, Bernardine Evaristo's joint 2019 win, Ian McEwan, Margaret Atwood (yes!), Penelope Lively, J.M. Coetzee, the International Booker (translated fiction), and the longlists, shortlists, and judging panels.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly. Wrong answers earn zero. Tap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Choose 10 or 20 questions in Settings.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as ManBookerQuizSettings),
  reducer,isTerminal,
  hint: (state: ManBookerQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:ManBookerQuizGame,
};
