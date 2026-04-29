import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PictionaryManiaQuizState, PictionaryManiaQuizAction, PictionaryManiaQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PictionaryManiaQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const pictionaryManiaQuizPlugin: GamePlugin<PictionaryManiaQuizState, PictionaryManiaQuizAction, typeof settings> = {
  id:"pictionary-mania-quiz", title:"Pictionary Mania Trivia", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trivia about Pictionary's all-teams-draw-at-once chaotic spinoff.",
  howToPlay:"Pictionary Mania Trivia tests your knowledge of the high-energy version of the classic drawing game where every team sketches at the same time. Questions cover the differences from base Pictionary, the categories, the publisher history, the timer rules, and the social mechanics that make Mania so frantically fun. You will see ten questions in total. Tap your answer choice, then press Submit. The faster you answer the more points you earn — each correct answer awards 100 base points plus 10 points for every second remaining on the 15-second timer. A wrong choice locks you in and reveals the correct answer immediately. Press Next to advance through the round. The game ends after all ten questions, and your final score reflects both accuracy and speed. Good for testing whether your party-game knowledge can keep up with everyone drawing at once.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as PictionaryManiaQuizSettings),
  reducer,isTerminal,component:PictionaryManiaQuizGame,
};
