import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DvonnAbsState, DvonnAbsAction, DvonnAbsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DvonnAbsGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const dvonnAbsPlugin: GamePlugin<DvonnAbsState, DvonnAbsAction, typeof settings> = {
  id:"dvonn-abs", title:"DVONN", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trivia about DVONN, the stacking abstract from the GIPF Project.",
  howToPlay:"DVONN Trivia is a ten-question quiz about DVONN, an abstract two-player strategy game by Kris Burm in the GIPF Project. Played on a 49-square hexagonal board, players place 23 black or white pieces and three red 'DVONN' pieces during a setup phase. In play, a stack of pieces moves a number of squares equal to its height in a straight line, landing on another stack and joining it. Stacks not connected to a DVONN piece (directly or via a chain of stacks) are removed from the board. When neither player can move, the player whose top-of-stack pieces total greater wins. Each question tests rules and tactics of DVONN. Tap an answer and Submit; correct answers earn 100 base points plus 10 per second remaining on the 15-second timer. Wrong answers reveal the correct option. After ten questions your final score is shown.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DvonnAbsSettings),
  reducer,isTerminal,component:DvonnAbsGame,
};
