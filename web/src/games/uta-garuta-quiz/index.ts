import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { UtaGarutaState, UtaGarutaAction, UtaGarutaSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { UtaGarutaGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const utaGarutaPlugin: GamePlugin<UtaGarutaState, UtaGarutaAction, typeof settings> = {
  id:"uta-garuta-quiz", title:"Uta Garuta Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of Uta Garuta, Japan's poem-reading card games.",
  howToPlay:"Uta Garuta is the umbrella name for any Japanese karuta game where one player reads a poem aloud while others race to grab the matching picture card. The most famous is Hyakunin Isshu, but many regional variants exist with local poets and themes. Uta Garuta combines memory, hearing, and physical reflex; competitive players can identify a poem from its very first syllable, before the reader has finished the line.\n\nThis is a 10-question multiple-choice quiz. Each question gives you 15 seconds to answer. Tap one of the four choices, then press Submit to lock in your answer.\n\nYou earn 100 base points for every correct answer plus 10 points for each second remaining on the clock — quick correct answers are worth far more than slow ones. Wrong answers earn nothing.\n\nAfter you submit, the correct answer is revealed: green for correct, red for wrong. Press Next to continue. The game ends after all 10 questions.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as UtaGarutaSettings),
  reducer,isTerminal,
  hint: (state: UtaGarutaState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:UtaGarutaGame,
};
