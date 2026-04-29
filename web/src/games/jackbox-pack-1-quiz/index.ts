import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { JackboxPack1QuizState, JackboxPack1QuizAction, JackboxPack1QuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { JackboxPack1QuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const jackboxPack1QuizPlugin: GamePlugin<JackboxPack1QuizState, JackboxPack1QuizAction, typeof settings> = {
  id:"jackbox-pack-1-quiz", title:"Jackbox Party Pack 1 Trivia", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trivia about Jackbox Party Pack 1: Fibbage XL, Drawful, Word Spud, You Don't Know Jack 2015, Lie Swatter.",
  howToPlay:"Jackbox Party Pack 1 Trivia covers the foundational Jackbox bundle that introduced web-controller party gaming to many players. Questions explore the five-game lineup, the developer, the launch year, the audience join URL, and the design tone. Each round delivers ten questions. Tap an answer and press Submit. Correct answers earn 100 base points plus 10 points per second remaining on the 15-second timer, so fast picks pay off. Wrong answers reveal the correct option and lock further input; press Next to advance. After ten questions, your final score is shown. If you played Pack 1 at its 2014 release and remember the thrill of using your phone as a controller for the first time, or if you discovered the franchise more recently, this quiz will reveal how well you know the lineup that started a party-gaming revolution.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as JackboxPack1QuizSettings),
  reducer,isTerminal,component:JackboxPack1QuizGame,
};
