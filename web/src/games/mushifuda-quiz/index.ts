import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MushifudaState, MushifudaAction, MushifudaSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MushifudaGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const mushifudaPlugin: GamePlugin<MushifudaState, MushifudaAction, typeof settings> = {
  id:"mushifuda-quiz", title:"Mushifuda Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of Mushifuda, the Nagasaki regional Hanafuda variant.",
  howToPlay:"Mushifuda is a regional variant of Hanafuda played mainly in Nagasaki and parts of Kyushu, Japan. The deck is reduced — the months from July to December are removed — leaving 24 cards. The trimmed deck simplifies play and shifts strategy: with fewer suits to track, matching becomes faster and more luck-driven. Mushifuda is often the children's introduction to flower cards in its home region.\n\nThis is a 10-question multiple-choice quiz. Each question gives you 15 seconds to answer. Tap one of the four choices, then press Submit to lock in your answer.\n\nYou earn 100 base points for every correct answer plus 10 points for each second remaining on the clock — quick correct answers are worth far more than slow ones. Wrong answers earn nothing.\n\nAfter you submit, the correct answer is revealed: green for correct, red for wrong. Press Next to continue. The game ends after all 10 questions.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as MushifudaSettings),
  reducer,isTerminal,
  hint: (state: MushifudaState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:MushifudaGame,
};
