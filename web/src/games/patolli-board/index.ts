import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PatolliBoardState, PatolliBoardAction, PatolliBoardSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PatolliBoardGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const patolliBoardPlugin: GamePlugin<PatolliBoardState, PatolliBoardAction, typeof settings> = {
  id:"patolli-board", title:"Patolli", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trivia about Patolli, the Aztec/Mesoamerican cross-shaped race game.",
  howToPlay:"Patolli Trivia is a ten-question quiz about Patolli, an Aztec and Mesoamerican race game played on a cross-shaped (X) board. Players raced six tokens around the board, moving according to throws of marked beans (often five). Patolli was a highly social and ritual game; players bet jewelry, capes, food, and even their freedom on the outcome. The Spanish conquerors banned the game and its priest-players for its perceived spiritual significance and gambling associations. Each question tests known rules, components, and history of Patolli. Tap an answer and Submit; correct answers earn 100 base points plus 10 per second remaining on the 15-second timer. Wrong answers reveal the correct option. After ten questions your final score is shown.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as PatolliBoardSettings),
  reducer,isTerminal,hint: (state: PatolliBoardState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-patolli-board-answer-0"]', pulses: 3 } : null, component:PatolliBoardGame,
};
