import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MehenBoardState, MehenBoardAction, MehenBoardSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MehenBoardGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const mehenBoardPlugin: GamePlugin<MehenBoardState, MehenBoardAction, typeof settings> = {
  id:"mehen-board", title:"Mehen", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trivia about Mehen, the ancient Egyptian spiral race game.",
  howToPlay:"Mehen Trivia is a ten-question quiz about Mehen, an ancient Egyptian board game played on a serpent-shaped spiral track. The board is a coiled snake (mehen meaning 'coiled one' in Egyptian) divided into segments. Players moved lion-shaped tokens (and possibly small marbles) from the snake's tail toward its head. Boards have been found in tombs dating from the predynastic period to about 2300 BCE. While the precise rules are lost to history, scholars infer it was a race game using throw-sticks for randomness, and likely up to six players. Each question tests known facts and reconstruction history of Mehen. Tap an answer and Submit; correct answers earn 100 base points plus 10 per second remaining on the 15-second timer. Wrong answers reveal the correct option. After ten questions your final score is shown.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as MehenBoardSettings),
  reducer,isTerminal,hint: (state: MehenBoardState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-mehen-board-answer-0"]', pulses: 3 } : null, component:MehenBoardGame,
};
