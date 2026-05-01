import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { EndlessShootEmUpState, EndlessShootEmUpAction, EndlessShootEmUpSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { EndlessShootEmUpGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const endlessShootEmUpPlugin: GamePlugin<EndlessShootEmUpState, EndlessShootEmUpAction, typeof settings> = {
  id:"endless-shoot-em-up", title:"Endless Shoot-'Em-Up", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trivia about endless shoot-em-up survival arcade games.",
  howToPlay:"Endless Shoot-'Em-Up Trivia is a ten-question quiz about endless shoot-em-up arcade games — a genre where the player pilots a ship/character that auto-fires (or fires on tap) at endless waves of enemies. Examples include Geometry Wars, Vampire Survivors, and many bullet-hell endless modes. The player typically moves with one input and aims/fires with another (or a single dual-stick stick). Score scales with kills and survival time. Each question tests genre history, mechanics, and famous titles. Tap an answer and Submit; correct answers earn 100 base points plus 10 per second remaining on the 15-second timer. Wrong answers reveal the correct option. After ten questions your final score is shown.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as EndlessShootEmUpSettings),
  reducer,isTerminal,component:EndlessShootEmUpGame,
};
