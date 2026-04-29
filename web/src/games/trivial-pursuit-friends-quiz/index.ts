import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TrivialPursuitFriendsQuizState, TrivialPursuitFriendsQuizAction, TrivialPursuitFriendsQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TrivialPursuitFriendsQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const trivialPursuitFriendsQuizPlugin: GamePlugin<TrivialPursuitFriendsQuizState, TrivialPursuitFriendsQuizAction, typeof settings> = {
  id:"trivial-pursuit-friends-quiz", title:"Trivial Pursuit Friends Trivia", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trivia from the Friends edition: Central Perk, Manhattan apartments, and ten seasons.",
  howToPlay:"Trivial Pursuit Friends Trivia tests your knowledge of the iconic 1990s-2000s sitcom set in Manhattan and centered on six friends drinking far too much coffee at Central Perk. Topics span all ten seasons — from Ross's many marriages to Joey's auditions, Phoebe's eccentric songs, and Monica's perfectionism. The round delivers ten questions. Tap your answer and press Submit. Correct answers score 100 base points plus 10 per second left on the 15-second timer, so quick recall pays. Wrong picks reveal the correct option and lock further input; press Next to continue. After ten questions, your final score appears. If you can sing 'Smelly Cat' on demand, recite 'PIVOT' with feeling, or remember exactly how Chandler Bing's job is described, you'll feel right at home in this quiz. Otherwise, you'll learn a few new facts to share at brunch.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as TrivialPursuitFriendsQuizSettings),
  reducer,isTerminal,component:TrivialPursuitFriendsQuizGame,
};
