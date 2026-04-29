import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DoodleJumpArcadeState, DoodleJumpArcadeAction, DoodleJumpArcadeSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DoodleJumpArcadeGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const doodleJumpArcadePlugin: GamePlugin<DoodleJumpArcadeState, DoodleJumpArcadeAction, typeof settings> = {
  id:"doodle-jump-arcade", title:"Doodle Jump-Style", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trivia about Doodle Jump-style endless vertical jumpers.",
  howToPlay:"Doodle Jump-Style Trivia is a ten-question quiz about Doodle Jump and the wider genre of endless vertical jumper mobile games. The player auto-bounces upward on platforms, tilting or tapping to land on the next platform. Missing a platform causes a fall and game over. Score is based on height climbed. Doodle Jump (Lima Sky, 2009) was a smash hit that helped define the casual mobile genre. Examples include Mega Jump, Jetpack Jump, and many spinoffs. Each question tests history, mechanics, and famous titles in the vertical jumper genre. Tap an answer and Submit; correct answers earn 100 base points plus 10 per second remaining on the 15-second timer. Wrong answers reveal the correct option. After ten questions your final score is shown.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DoodleJumpArcadeSettings),
  reducer,isTerminal,component:DoodleJumpArcadeGame,
};
