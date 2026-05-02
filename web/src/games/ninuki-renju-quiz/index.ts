import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { NinukiRenjuState, NinukiRenjuAction, NinukiRenjuSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { NinukiRenjuGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const ninukiRenjuPlugin: GamePlugin<NinukiRenjuState, NinukiRenjuAction, typeof settings> = {
  id:"ninuki-renju-quiz", title:"Ninuki-Renju Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of Ninuki-Renju, the captures-and-five variant.",
  howToPlay:"Ninuki-Renju is a Renju/Gomoku variant that adds a second win condition: in addition to forming five-in-a-row, a player can win by capturing five pairs of opposing stones. A pair is captured by sandwiching two adjacent opposing stones between two of your own. The dual conditions create exciting tactical battles — players must defend both against five-in-a-row threats and against accumulating capture losses.\n\nThis is a 10-question multiple-choice quiz. Each question gives you 15 seconds to answer. Tap one of the four choices, then press Submit to lock in your answer.\n\nYou earn 100 base points for every correct answer plus 10 points for each second remaining on the clock — quick correct answers are worth far more than slow ones. Wrong answers earn nothing.\n\nAfter you submit, the correct answer is revealed: green for correct, red for wrong. Press Next to continue. The game ends after all 10 questions.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as NinukiRenjuSettings),
  reducer,isTerminal,
  hint: (state: NinukiRenjuState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:NinukiRenjuGame,
};
