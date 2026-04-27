import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PiePopState, PiePopAction, PiePopSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PiePopGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const piePopPlugin: GamePlugin<PiePopState, PiePopAction, typeof settings> = {
  id:"pie-pop", title:"Pie Pop", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Pop pies cooling on the rack. 30-second clicker.",
  howToPlay:`Pie Pop is a 30-second bakery clicker. Fresh pies appear on the cooling rack across six lanes; tap each pie before it cools off and falls away. Each pie popped scores 10 points.

The game ticks once per second, with new pies spawning in random lanes. Pies stay visible for a handful of ticks then disappear. Miss too many and your score suffers.

There is no skill ceiling — the more pies you click in 30 seconds, the higher your score. Average runs cluster around 200-300 points; record-chasers push 500+. The clock counts down at the top right; when it hits zero, your final score is locked in.

Mash that screen and rack up those pie points before they slip away!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as PiePopSettings),
  reducer,isTerminal,component:PiePopGame,
};
