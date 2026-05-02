import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { NagaCardState, NagaCardAction, NagaCardSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { NagaCardGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const nagaCardPlugin: GamePlugin<NagaCardState, NagaCardAction, typeof settings> = {
  id:"naga-card-quiz", title:"Naga Snake Card Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of the Thai children's colour-matching card game Naga.",
  howToPlay:"Naga is a Thai children's card game using a colour-matching snake card set. Players form chains of matching coloured cards to build a 'naga' or serpent on the table, learning colours and basic strategy along the way.\n\nThis is a 10-question multiple-choice quiz. Each question gives you 15 seconds to answer. Tap one of the four choices, then press Submit to lock in your answer. You earn 100 base points for every correct answer plus 10 points for each second remaining on the clock — quick correct answers are worth far more than slow ones. Wrong answers earn nothing.\n\nAfter you submit, the correct answer is revealed: green for correct, red for wrong. Press Next to continue. The game ends after all 10 questions.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as NagaCardSettings),
  reducer,isTerminal,
  hint: (state: NagaCardState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:NagaCardGame,
};
