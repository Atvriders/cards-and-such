import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { KabufudaState, KabufudaAction, KabufudaSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { KabufudaGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const kabufudaPlugin: GamePlugin<KabufudaState, KabufudaAction, typeof settings> = {
  id:"kabufuda-quiz", title:"Kabufuda Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of the 40-card Kabufuda deck.",
  howToPlay:"Kabufuda is a simplified 40-card Japanese card deck derived from the older Tensho karuta. It is the standard deck for Oicho-Kabu, a baccarat-like Japanese casino game where the goal is to reach a hand value closest to nine.\n\nThis is a 10-question multiple-choice quiz. Each question gives you 15 seconds to answer. Tap one of the four choices, then press Submit to lock in your answer. You earn 100 base points for every correct answer plus 10 points for each second remaining on the clock — quick correct answers are worth far more than slow ones. Wrong answers earn nothing.\n\nAfter you submit, the correct answer is revealed: green for correct, red for wrong. Press Next to continue. The game ends after all 10 questions.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as KabufudaSettings),
  reducer,isTerminal,
  hint: (state: KabufudaState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:KabufudaGame,
};
