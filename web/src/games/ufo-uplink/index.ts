import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { UfoUplinkState, UfoUplinkAction, UfoUplinkSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { UfoUplinkGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const ufoUplinkPlugin: GamePlugin<UfoUplinkState, UfoUplinkAction, typeof settings> = {
  id:"ufo-uplink", title:"UFO Uplink", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Click UFOs zooming past in 30 seconds. Sci-fi clicker.",
  howToPlay:"UFO Uplink is a 30-second sci-fi clicker arcade. Mysterious flying saucers warp in and drift across six sky lanes; tap each UFO before it phases out for 10 points apiece. Each saucer hangs around for a few ticks — let too many slip into hyperspace and your final tally suffers.\n\nThe board ticks every 750ms, spawning fresh UFOs in random lanes. The night sky can quickly fill with humming targets, so practice your hand-eye coordination and aim carefully — every UFO you tap is one more uplink confirmed and 10 points closer to a top score.\n\nThere's no skill ceiling: the more UFOs you click in 30 seconds, the higher your score. Average runs land near 200-300 points; sharpshooters pushing 500+ are real reflex talent. The clock counts down in the top right; when it hits zero, your final score is locked in.\n\nTap fast, chase the saucers, and complete that uplink!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as UfoUplinkSettings),
  reducer,isTerminal,
  hint: (state: UfoUplinkState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (!state.targets || state.targets.length === 0) return null;
    return { selector: '[data-testid="hint-target-ufo-uplink-target"]', pulses: 3 };
  },
  component:UfoUplinkGame,
};
