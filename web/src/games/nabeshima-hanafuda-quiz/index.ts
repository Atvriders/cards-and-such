import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { NabeshimaHanafudaState, NabeshimaHanafudaAction, NabeshimaHanafudaSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { NabeshimaHanafudaGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const nabeshimaHanafudaPlugin: GamePlugin<NabeshimaHanafudaState, NabeshimaHanafudaAction, typeof settings> = {
  id:"nabeshima-hanafuda-quiz", title:"Nabeshima Hanafuda Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of the Kyushu regional Hanafuda variant Nabeshima.",
  howToPlay:"Nabeshima Hanafuda is a regional Kyushu variant of the Hanafuda matching game. It uses the standard 48-card deck but features unique yaku names and slightly different scoring rules from mainstream Koi-Koi.\n\nThis is a 10-question multiple-choice quiz. Each question gives you 15 seconds to answer. Tap one of the four choices, then press Submit to lock in your answer. You earn 100 base points for every correct answer plus 10 points for each second remaining on the clock — quick correct answers are worth far more than slow ones. Wrong answers earn nothing.\n\nAfter you submit, the correct answer is revealed: green for correct, red for wrong. Press Next to continue. The game ends after all 10 questions.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as NabeshimaHanafudaSettings),
  reducer,isTerminal,
  hint: (state: NabeshimaHanafudaState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:NabeshimaHanafudaGame,
};
