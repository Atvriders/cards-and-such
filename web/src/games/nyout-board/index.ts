import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { NyoutBoardState, NyoutBoardAction, NyoutBoardSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { NyoutBoardGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const nyoutBoardPlugin: GamePlugin<NyoutBoardState, NyoutBoardAction, typeof settings> = {
  id:"nyout-board", title:"Nyout", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trivia about Nyout, the Korean cross-shaped traditional race game.",
  howToPlay:"Nyout Trivia is a ten-question quiz about Nyout (also spelled Yut Nori or just Yut), a traditional Korean cross-shaped race game using throwing sticks (yut) for randomness. Each player has multiple tokens (typically four) and races them around a board with a cross-shaped outline that includes shortcuts through the center. Yut sticks are flat on one side and curved on the other; the number of curved sides facing up determines the move (1=Do, 2=Gae, 3=Gul, 4=Yut, 5=Mo). Yut is hugely popular in Korea, especially during the Lunar New Year. Each question tests rules and culture of Nyout/Yut. Tap an answer and Submit; correct answers earn 100 base points plus 10 per second remaining on the 15-second timer. Wrong answers reveal the correct option. After ten questions your final score is shown.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as NyoutBoardSettings),
  reducer,isTerminal,component:NyoutBoardGame,
};
