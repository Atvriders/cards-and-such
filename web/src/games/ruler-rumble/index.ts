import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { RulerRumbleState, RulerRumbleAction, RulerRumbleSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { RulerRumbleGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const rulerRumblePlugin: GamePlugin<RulerRumbleState, RulerRumbleAction, typeof settings> = {
  id:"ruler-rumble", title:"Ruler Rumble", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Click rulers in a ruler-rattling rumble. 25-second clicker.",
  howToPlay:"Ruler Rumble is a 25-second office-supply clicker — a tighter timer than its cousins, demanding a faster pace. Rulers spawn across 6 lanes; tap each one to score 10 points. Each ruler hangs around for a few ticks before flicking off — miss too many and your final tally suffers.\n\nThe game ticks once per second, spawning fresh rulers in random lanes. With only 25 seconds on the clock, every miss costs you significantly more than in a typical 30-second clicker, so practice your hand-eye coordination and aim carefully.\n\nAverage runs land near 180-260 points (the shorter timer is balanced by busier spawns); sharpshooters pushing 400+ are showing real reflex talent. The clock counts down in the top right.\n\nMeasure up and rumble through the rulers!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as RulerRumbleSettings),
  reducer,isTerminal,
  hint: (state: RulerRumbleState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (!state.targets || state.targets.length === 0) return null;
    return { selector: '[data-testid="hint-target-ruler-rumble-target"]', pulses: 3 };
  },
  component:RulerRumbleGame,
};
