import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PictionaryBaseQuizState, PictionaryBaseQuizAction, PictionaryBaseQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PictionaryBaseQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const pictionaryBaseQuizPlugin: GamePlugin<PictionaryBaseQuizState, PictionaryBaseQuizAction, typeof settings> = {
  id:"pictionary-base-quiz", title:"Pictionary Trivia", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trivia about Pictionary, the classic team drawing-and-guessing party game.",
  howToPlay:"Pictionary Trivia is a ten-question quiz celebrating the legendary team drawing game where players sketch a clue from a card while teammates race to guess what it is before the timer runs out. Across each round you'll be asked about Pictionary's rules, publisher, history, categories on the cards, the all-play space, the iconic timer, and the way teams advance around the colourful board. Tap the answer you believe is correct and press Submit. A correct answer awards 100 base points plus 10 extra points for every second left on the 15-second clock, so quick recall is rewarded. A wrong answer reveals the correct option and locks the round before letting you continue. After ten questions, your final score is shown. Whether you're a veteran of family game nights or curious about this party-game cornerstone, see how much of Pictionary's history and structure you can recall under pressure.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as PictionaryBaseQuizSettings),
  reducer,isTerminal,component:PictionaryBaseQuizGame,
};
