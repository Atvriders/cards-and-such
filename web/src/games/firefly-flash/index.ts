import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { FireflyFlashState, FireflyFlashAction, FireflyFlashSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { FireflyFlashGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const fireflyFlashPlugin: GamePlugin<FireflyFlashState, FireflyFlashAction, typeof settings> = {
  id:"firefly-flash", title:"Firefly Flash", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Click flashing fireflies in 30 seconds.",
  howToPlay:"Firefly Flash is a 30-second clicker arcade with a magical, twilight-summer theme. Fireflies twinkle across the screen in six lanes; tap each flash as fast as you can for 10 points. Each firefly glows for a few ticks before fading into the night — miss too many and your final tally suffers.\n\nThe game ticks roughly once per second, spawning fresh fireflies in random lanes. The screen can quickly fill with twinkling targets, so quick taps and good visual scanning are key.\n\nAverage runs land near 200-300 points; sharpshooters pushing 500+ are showing real reflex talent. The clock counts down in the top right; when it hits zero, your final score is locked in. Capture the magic of summer evenings — flash by flash. Click those glowing dots!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as FireflyFlashSettings),
  reducer,isTerminal,
  hint: (state: FireflyFlashState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (!state.bugs || state.bugs.length === 0) return null;
    return { selector: '[data-testid="hint-target-firefly-flash-target"]', pulses: 3 };
  },
  component:FireflyFlashGame,
};
