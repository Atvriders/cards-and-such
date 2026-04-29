import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { QuoridorAbsState, QuoridorAbsAction, QuoridorAbsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { QuoridorAbsGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const quoridorAbsPlugin: GamePlugin<QuoridorAbsState, QuoridorAbsAction, typeof settings> = {
  id:"quoridor-abs", title:"Quoridor", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trivia about Quoridor, the abstract pawn-race game with placeable walls.",
  howToPlay:"Quoridor Trivia is a ten-question quiz about Quoridor, a brilliant abstract strategy game for 2-4 players invented by Mirko Marchesi and published by Gigamic. Each player races their pawn from one side of a 9×9 grid to the opposite side. On their turn a player either moves their pawn one square (orthogonally) or places a wall to block opponents — but never to fully wall them off. Walls span two squares and can't intersect placed walls. The first pawn to reach the opposite row wins. Each question tests rules, design, and strategy of Quoridor. Tap an answer and Submit; correct answers earn 100 base points plus 10 per second remaining on the 15-second timer. Wrong answers reveal the correct option. After ten questions your final score is shown. Quoridor is a Mensa Select winner that fits in your pocket but rivals chess in tactical depth.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as QuoridorAbsSettings),
  reducer,isTerminal,component:QuoridorAbsGame,
};
