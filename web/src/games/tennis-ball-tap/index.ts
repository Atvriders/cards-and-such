import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TennisBallTapState, TennisBallTapAction, TennisBallTapSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TennisBallTapGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const tennisBallTapPlugin: GamePlugin<TennisBallTapState, TennisBallTapAction, typeof settings> = {
  id:"tennis-ball-tap", title:"Tennis Ball Tap", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Tap tennis balls bouncing across the screen — 30 seconds.",
  howToPlay:"Tennis Ball Tap is a 30-second arcade clicker. Tennis balls appear in random spots across the field; tap them as fast as you can to score 10 points per hit. Targets only stick around for a few ticks before drifting off — every miss is a missed opportunity.\n\nThe board fills with new targets each tick (about once per second), spawning across six lanes. Stay alert: too many targets at once can overwhelm you. There are no power-ups, no combos — just pure reaction speed and finger reflexes.\n\nAverage runs land at about 200-300 points; sharp reflexes can push past 500. Top scores reward precision over panic — pick the closest, most-likely-to-disappear target and tap with intent. The clock counts down in the upper right corner; when it hits zero, your final tally is locked.\n\nGood luck — and may your taps be true!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as TennisBallTapSettings),
  reducer,isTerminal,
  hint: (state: TennisBallTapState) => {
    if (state.phase === "done") return null;
    if (!state.targets || state.targets.length === 0) return null;
    return { selector: ".ftap-target", pulses: 3 };
  },
  component:TennisBallTapGame,
};
