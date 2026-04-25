import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PaperArrowState, PaperArrowAction, PaperArrowSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PaperArrow } from "./Game.js";
const settings = { arrows: { kind:"enum" as const, label:"Arrows", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const paperArrowPlugin: GamePlugin<PaperArrowState, PaperArrowAction, typeof settings> = {
  id:"paper-arrow", title:"Paper Arrow", category:"arcade",
  players:{min:1,max:1,multiplayer:false},
  description:"Launch paper arrows at circular targets — aim for the bullseye for maximum points!",
  howToPlay:`Paper Arrow is an arcade aim game. A circular target appears at a random position on the board each round. Click at the target's horizontal position to shoot a paper arrow at it.

A direct hit scores 100 points. Hitting closer to the bullseye center adds up to 50 bonus points. A miss earns nothing. After each shot, a new target appears at a different position.

With 10 or 20 arrows (configurable in Settings), your goal is to hit as many targets as possible and aim for bullseyes. The target is about 6% of the board width — precise clicking is required.

The archer is positioned at the bottom center. The key skill is reading the target's position and clicking precisely at the correct horizontal position. Bullseye hits (all 150 pts) with 20 arrows = 3000 pts maximum. Can you be a paper archery champion?`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as PaperArrowSettings),
  reducer, isTerminal, component:PaperArrow,
};
