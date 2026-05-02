import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DdakjiState, DdakjiAction, DdakjiSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DdakjiGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const ddakjiPlugin: GamePlugin<DdakjiState, DdakjiAction, typeof settings> = {
  id:"ddakji-quiz", title:"Ddakji Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of Ddakji, the Korean folded-paper flipping game.",
  howToPlay:"Ddakji is a traditional Korean children's game played with folded square paper tiles called ddakji. Two players take turns slamming their own ddakji onto the opponent's ddakji on the ground; if the impact flips the opponent's tile over, you capture it. The game requires throwing technique, paper-folding skill, and a ground surface with the right amount of grip. Ddakji gained worldwide attention through its appearance in the Korean Netflix series 'Squid Game'.\n\nThis is a 10-question multiple-choice quiz. Each question gives you 15 seconds to answer. Tap one of the four choices, then press Submit to lock in your answer.\n\nYou earn 100 base points for every correct answer plus 10 points for each second remaining on the clock — quick correct answers are worth far more than slow ones. Wrong answers earn nothing.\n\nAfter you submit, the correct answer is revealed: green for correct, red for wrong. Press Next to continue. The game ends after all 10 questions.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DdakjiSettings),
  reducer,isTerminal,
  hint: (state: DdakjiState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:DdakjiGame,
};
