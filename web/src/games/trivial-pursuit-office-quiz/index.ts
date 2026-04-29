import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TrivialPursuitOfficeQuizState, TrivialPursuitOfficeQuizAction, TrivialPursuitOfficeQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TrivialPursuitOfficeQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const trivialPursuitOfficeQuizPlugin: GamePlugin<TrivialPursuitOfficeQuizState, TrivialPursuitOfficeQuizAction, typeof settings> = {
  id:"trivial-pursuit-office-quiz", title:"Trivial Pursuit The Office Trivia", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trivia from The Office (US) edition: Scranton, Dunder Mifflin, and the iconic ensemble.",
  howToPlay:"Trivial Pursuit The Office Trivia covers the beloved nine-season U.S. sitcom set at Dunder Mifflin's Scranton branch. Questions span Michael Scott's antics, Dwight's beet farm, Pam and Jim's romance, Andy's a cappella obsessions, and beyond. The round contains ten questions. Tap your selected answer, then press Submit. Each correct answer scores 100 base points plus 10 points per second remaining on the 15-second timer, so think fast. A wrong answer reveals the correct option and disables further input; press Next to advance. After ten questions, your final score is shown. Whether you can recite Threat Level Midnight from memory, remember every episode of Dinner Party in painful detail, or simply know what a Schrute Buck is worth, this quiz will reveal how thoroughly Dunder Mifflin lives in your head.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as TrivialPursuitOfficeQuizSettings),
  reducer,isTerminal,component:TrivialPursuitOfficeQuizGame,
};
