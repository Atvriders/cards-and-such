import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { AsteroidAimState, AsteroidAimAction, AsteroidAimSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { AsteroidAimGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const asteroidAimPlugin: GamePlugin<AsteroidAimState, AsteroidAimAction, typeof settings> = {
  id:"asteroid-aim", title:"Asteroid Aim", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Click asteroids before they hit Earth. 30-second clicker.",
  howToPlay:"Asteroid Aim is a 30-second sci-fi clicker arcade where Earth's defense is in your hands. Asteroids tumble toward the planet across six trajectory lanes; tap each rock before it impacts for 10 points apiece. Miss too many and Earth takes a beating in your final tally.\n\nThe defense grid ticks every 750ms, spawning fresh asteroids in random lanes. The screen can quickly fill with incoming threats, so practice your hand-eye coordination and aim carefully — every asteroid you destroy is one more disaster averted and 10 points closer to a top score.\n\nThere's no skill ceiling: the more asteroids you click in 30 seconds, the higher your score. Average runs land near 200-300 points; sharpshooters pushing 500+ are real planetary defenders. The clock counts down in the top right; when it hits zero, your final score is locked in.\n\nAim, click, save the planet!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as AsteroidAimSettings),
  reducer,isTerminal,component:AsteroidAimGame,
};
