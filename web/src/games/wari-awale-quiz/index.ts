import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { WariAwaleState, WariAwaleAction, WariAwaleSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { WariAwaleGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const wariAwalePlugin: GamePlugin<WariAwaleState, WariAwaleAction, typeof settings> = {
  id:"wari-awale-quiz", title:"Wari (Awale) Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of the Akan two-player mancala Wari.",
  howToPlay:"Wari (Awale) is an Akan two-player mancala from West Africa. Players sow seeds around the board and capture them based on rules tied to the count in opponent's pits — the first to gather twenty-five seeds wins.\n\nThis is a 10-question multiple-choice quiz. Each question gives you 15 seconds to answer. Tap one of the four choices, then press Submit to lock in your answer. You earn 100 base points for every correct answer plus 10 points for each second remaining on the clock — quick correct answers are worth far more than slow ones. Wrong answers earn nothing.\n\nAfter you submit, the correct answer is revealed: green for correct, red for wrong. Press Next to continue. The game ends after all 10 questions.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as WariAwaleSettings),
  reducer,isTerminal,
  hint: (state: WariAwaleState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:WariAwaleGame,
};
