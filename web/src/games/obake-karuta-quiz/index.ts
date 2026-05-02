import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ObakeKarutaState, ObakeKarutaAction, ObakeKarutaSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ObakeKarutaGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const obakeKarutaPlugin: GamePlugin<ObakeKarutaState, ObakeKarutaAction, typeof settings> = {
  id:"obake-karuta-quiz", title:"Obake Karuta Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of Obake Karuta, the yokai-themed children's matching game.",
  howToPlay:"Obake Karuta ('ghost karuta') is a children's variant of the karuta family that features illustrations of obake and yokai — the ghosts and spirits of Japanese folklore. A reader calls out a clue or short rhyme about a yokai while the children race to grab the matching picture card. Originating in the Edo period, Obake Karuta was both entertainment and folk education, teaching children the names and traits of dozens of supernatural creatures.\n\nThis is a 10-question multiple-choice quiz. Each question gives you 15 seconds to answer. Tap one of the four choices, then press Submit to lock in your answer.\n\nYou earn 100 base points for every correct answer plus 10 points for each second remaining on the clock — quick correct answers are worth far more than slow ones. Wrong answers earn nothing.\n\nAfter you submit, the correct answer is revealed: green for correct, red for wrong. Press Next to continue. The game ends after all 10 questions.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as ObakeKarutaSettings),
  reducer,isTerminal,
  hint: (state: ObakeKarutaState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:ObakeKarutaGame,
};
