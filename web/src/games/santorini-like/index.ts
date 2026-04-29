import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SantoriniLikeState, SantoriniLikeAction, SantoriniLikeSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SantoriniLikeGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const santoriniLikePlugin: GamePlugin<SantoriniLikeState, SantoriniLikeAction, typeof settings> = {
  id:"santorini-like", title:"Santorini-like", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trivia about Santorini-like games where players build towers and climb.",
  howToPlay:"Santorini-like Trivia is a ten-question quiz about Santorini, the abstract two-player game by Gordon Hamilton (later published by Roxley Games) and games inspired by it. On a 5×5 grid, each player has two builders/workers. On a turn the player moves one worker one square (including diagonally and up one level), then builds on an adjacent square — adding a level (up to three) or a dome (capping that tower). The first player to move a worker onto a tower of three levels wins. The game also includes optional god-power cards that add asymmetric special powers. Each question tests rules, divine powers, and design of Santorini-like games. Tap an answer and Submit; correct answers earn 100 base points plus 10 per second remaining on the 15-second timer. Wrong answers reveal the correct option. After ten questions your final score is shown.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as SantoriniLikeSettings),
  reducer,isTerminal,component:SantoriniLikeGame,
};
