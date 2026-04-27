import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ChessHistoryQuizState, ChessHistoryQuizAction, ChessHistoryQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ChessHistoryQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const chessHistoryQuizPlugin: GamePlugin<ChessHistoryQuizState, ChessHistoryQuizAction, typeof settings> = {
  id:"chess-history-quiz", title:"Chess History Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of chess champions, openings, and historic matches.",
  howToPlay:"Chess History Quiz tests your knowledge of chess history, champions, and openings across 10 or 20 multiple-choice questions. Each question has four answer choices and a 15-second timer.\n\nWhen the question appears, read carefully and tap the choice you think is correct, then press Submit. Correct answers earn 100 base points plus 10 bonus points for every second remaining on the clock — quick thinking pays off. Wrong answers earn zero, and the timer running out submits a blank.\n\nAfter you submit, the right answer glows green and any wrong choice you picked turns red, so you always learn the correct answer before continuing. Press Next to move on.\n\nYou can choose 10 or 20 questions in the Settings panel before starting. Questions are shuffled from a pool every game, and the answer choices are also reordered, so two runs in a row never feel the same. Mix knowledge with reflexes for the highest score, and aim for a perfect run!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as ChessHistoryQuizSettings),
  reducer,isTerminal,component:ChessHistoryQuizGame,
};
