import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DragonflyDartState, DragonflyDartAction, DragonflyDartSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DragonflyDartGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const dragonflyDartPlugin: GamePlugin<DragonflyDartState, DragonflyDartAction, typeof settings> = {
  id:"dragonfly-dart", title:"Dragonfly Dart", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Click darting dragonflies in 30 seconds.",
  howToPlay:"Dragonfly Dart is a 30-second clicker arcade with a pond-skimming theme. Dragonflies dart across the screen in six lanes; tap each one as fast as you can to catch it for 10 points. Each dragonfly hovers for only a few ticks before darting off — miss too many and your final tally suffers.\n\nThe game ticks roughly once per second, spawning fresh dragonflies in random lanes. The screen can quickly fill with iridescent, fast-moving targets, so quick taps and good visual scanning are key.\n\nAverage runs land near 200-300 points; sharpshooters pushing 500+ are showing real reflex talent. The clock counts down in the top right; when it hits zero, your final score is locked in. Capture summer's most graceful pond-dwellers — dart by dart. Aim true!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DragonflyDartSettings),
  reducer,isTerminal,
  hint: (state: DragonflyDartState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (!state.bugs || state.bugs.length === 0) return null;
    return { selector: '[data-testid="hint-target-dragonfly-dart-target"]', pulses: 3 };
  },
  component:DragonflyDartGame,
};
