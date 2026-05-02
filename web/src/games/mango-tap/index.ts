import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MangoTapState, MangoTapAction, MangoTapSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MangoTapGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const mangoTapPlugin: GamePlugin<MangoTapState, MangoTapAction, typeof settings> = {
  id:"mango-tap", title:"Mango Tap", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Tap juicy mangoes as they drop. 30-second arcade.",
  howToPlay:"Mango Tap is a sweet, juicy 30-second clicker arcade. Mangoes drift across the screen in six lanes; tap each ripe mango as fast as you can to score 10 points. Each mango hangs around for a few ticks before drifting off — miss too many and your final tally suffers.\n\nThe game ticks roughly once per second, spawning fresh mangoes in random lanes. The board can quickly fill with juicy targets, so practice your hand-eye coordination and aim carefully — every mango you tap is 10 points closer to a top score.\n\nThere's no skill ceiling: the more mangoes you click in 30 seconds, the higher your score. Average runs land near 200-300 points; sharpshooters pushing 500+ are showing real reflex talent. The clock counts down in the top right; when it hits zero, your final score is locked in.\n\nGet those tropical points before the mango ripens off the tree!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as MangoTapSettings),
  reducer,isTerminal,
  hint: (state: MangoTapState) => {
    if (state.phase === "done") return null;
    if (!state.targets || state.targets.length === 0) return null;
    return { selector: ".mangotap-target", pulses: 3 };
  },
  component:MangoTapGame,
};
