import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CucumberCatchState, CucumberCatchAction, CucumberCatchSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CucumberCatchGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const cucumberCatchPlugin: GamePlugin<CucumberCatchState, CucumberCatchAction, typeof settings> = {
  id:"cucumber-catch", title:"Cucumber Catch", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Catch falling cucumbers in 5 lanes. 30-second clicker arcade — fresh and crisp.",
  howToPlay:`Cucumber Catch is a quick 30-second clicker arcade. Cucumbers fall through the screen in five lanes. Tap each one before it slips off-screen to score 10 points per cucumber.

The game ticks roughly once per second, spawning fresh cucumbers in random lanes. Each cucumber lingers for a few ticks before disappearing — miss too many and your score suffers, but missing doesn't cost you points (the worst that happens is you don't score).

There's no skill ceiling: the more cucumbers you tap in 30 seconds, the higher your score. Average runs land in the 200-300 point range; sharpshooters past 500 are showing real reflex talent. Watch the bottom of the timer; when it hits zero, your final score locks in.

Cucumbers are 96% water, full of vitamins K and C, and surprisingly delicious. Tap fast and stay hydrated!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CucumberCatchSettings),
  reducer,isTerminal,
  hint: (state: CucumberCatchState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (!state.targets || state.targets.length === 0) return null;
    return { selector: '[data-testid="hint-target-cucumber-catch-target"]', pulses: 3 };
  },
  component:CucumberCatchGame,
};
