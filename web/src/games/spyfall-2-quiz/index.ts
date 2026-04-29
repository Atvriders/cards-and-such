import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { Spyfall2QuizState, Spyfall2QuizAction, Spyfall2QuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Spyfall2QuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const spyfall2QuizPlugin: GamePlugin<Spyfall2QuizState, Spyfall2QuizAction, typeof settings> = {
  id:"spyfall-2-quiz", title:"Spyfall 2 Trivia", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trivia about Spyfall 2, the expanded location-deduction party game with two spies.",
  howToPlay:"Spyfall 2 Trivia is a ten-question quiz about the sequel to the legendary location-deduction party game, in which players ask each other questions to expose hidden spies who don't know the secret location. Each round you'll be tested on Spyfall 2's expanded cast (now up to twelve players), the addition of a second spy on certain rounds, the new locations and roles, the eight-minute timer, and the scoring chart. Select your answer and press Submit. A correct answer awards 100 base points plus 10 per second remaining on the 15-second timer, so quick recall pays off. A wrong answer reveals the correct option and locks the round so you can press Next. After ten questions, your final score is displayed. Spyfall 2 builds on a beloved core with bigger groups and more chaos — see how well you can blend in with the trivia's correct answers.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as Spyfall2QuizSettings),
  reducer,isTerminal,component:Spyfall2QuizGame,
};
