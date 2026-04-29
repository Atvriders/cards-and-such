import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { UnoFlipQuizState, UnoFlipQuizAction, UnoFlipQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { UnoFlipQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const unoFlipQuizPlugin: GamePlugin<UnoFlipQuizState, UnoFlipQuizAction, typeof settings> = {
  id:"uno-flip-quiz", title:"UNO Flip! Trivia", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trivia about UNO Flip!, the dual-sided UNO variant with a 'Dark Side' deck.",
  howToPlay:"UNO Flip! Trivia is a ten-question quiz about the popular UNO variant where every card has both a friendly Light Side and a punishing Dark Side, and a Flip card causes the entire deck to invert mid-game. Each round tests you on the new card types — Flip, Wild Flip, Skip Everyone, Draw 5 — and on how the harsher Dark Side rules differ from regular UNO. Select your answer and press Submit; a correct answer awards 100 base points plus 10 per second remaining on the 15-second timer, so quick recall counts. A wrong answer reveals the correct option and locks the round; press Next to continue. After ten questions, your final score appears. UNO Flip! is celebrated for adding fresh chaos to UNO without breaking what works — see how well you remember its dual-deck twist.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as UnoFlipQuizSettings),
  reducer,isTerminal,component:UnoFlipQuizGame,
};
