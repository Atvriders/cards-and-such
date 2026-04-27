import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ButterflyNetState, ButterflyNetAction, ButterflyNetSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ButterflyNetGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const butterflyNetPlugin: GamePlugin<ButterflyNetState, ButterflyNetAction, typeof settings> = {
  id:"butterfly-net", title:"Butterfly Net", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Garden arcade: 30-second butterflies clicker.",
  howToPlay:"Butterfly Net is a 30-second arcade clicker where butterflies flutter around the meadow in random lanes. Tap each butterfly to net it for 10 points before it floats away.\n\nButterflies spawn 1-2 per tick (about once per second). Each one lasts 3-5 ticks. Your net count, seconds remaining, and live score show at the top of the screen.\n\nThere's no penalty for missed butterflies — just lost points. Average runs land at 200-300; expert reflexes hit 500+. The game has no settings and no strategy beyond fast accurate tapping.\n\nButterflies move on the screen by lane; tap inside the lane to catch them. The 30-second timer is brisk and replay-friendly. When the clock hits zero, your final score is locked in. Bring your reflexes — and your butterfly net — and catch them all!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as ButterflyNetSettings),
  reducer,isTerminal,component:ButterflyNetGame,
};
