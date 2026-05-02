import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { KabuHanafudaState, KabuHanafudaAction, KabuHanafudaSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { KabuHanafudaGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const kabuHanafudaPlugin: GamePlugin<KabuHanafudaState, KabuHanafudaAction, typeof settings> = {
  id:"kabu-hanafuda-quiz", title:"Hanafuda Kabu Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of Kabu, the high-card Hanafuda gambling variant.",
  howToPlay:"Hanafuda Kabu is a Japanese gambling card game played with the 48-card Hanafuda deck. Each player receives a small hand and the goal is for the suit total of your hand modulo ten to be as close to nine as possible — exactly nine is called 'kabu'.\n\nThis is a 10-question multiple-choice quiz. Each question gives you 15 seconds to answer. Tap one of the four choices, then press Submit to lock in your answer. You earn 100 base points for every correct answer plus 10 points for each second remaining on the clock — quick correct answers are worth far more than slow ones. Wrong answers earn nothing.\n\nAfter you submit, the correct answer is revealed: green for correct, red for wrong. Press Next to continue. The game ends after all 10 questions.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as KabuHanafudaSettings),
  reducer,isTerminal,
  hint: (state: KabuHanafudaState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:KabuHanafudaGame,
};
