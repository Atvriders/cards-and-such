import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { RamenRushState, RamenRushAction, RamenRushSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { RamenRushGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const ramenRushPlugin: GamePlugin<RamenRushState, RamenRushAction, typeof settings> = {
  id:"ramen-rush", title:"Ramen Rush", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Click steaming ramen bowls before they cool off. 30-second clicker arcade.",
  howToPlay:"Ramen Rush is a 30-second clicker themed on Japan's most iconic noodle soup. Hot bowls of ramen pop up across the counter; tap each one before it gets cold and is whisked away. Every clicked bowl scores 10 points.\n\nThe game ticks roughly once per second, spawning fresh ramen bowls in random lanes. The screen can fill with steamy targets quickly, so practice your speed and aim — every bowl you serve is 10 points closer to noodle nirvana.\n\nThere's no skill ceiling: the more ramen you click in 30 seconds, the higher your score. Average runs land near 200-300 points; sharpshooters pushing 500+ are showing real ramen reflex. The clock counts down in the top right; when it hits zero, your final score is locked in.\n\nSlurp up those points before the broth goes cold!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as RamenRushSettings),
  reducer,isTerminal,component:RamenRushGame,
};
