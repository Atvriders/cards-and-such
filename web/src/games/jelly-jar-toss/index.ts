import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { JellyJarTossState, JellyJarTossAction, JellyJarTossSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { JellyJarTossGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const jellyJarTossPlugin: GamePlugin<JellyJarTossState, JellyJarTossAction, typeof settings> = {
  id: "jelly-jar-toss", title: "Jelly Jar Toss", category: "arcade",
  players: { min:1, max:1, multiplayer:false },
  description: "Toss a jelly jar onto the shelf at just the right power — wobble-free landing scores big!",
  howToPlay: `Jelly Jar Toss challenges you to land a jar of jelly on a shelf without it wobbling off. Each round set your power slider and press Go! — the closer your power to the hidden target, the more stable the landing and the higher your score. 10 rounds of jar-launching joy!`,
  settings,
  initialState: (seed:number, s:S) => initialState(seed, s as JellyJarTossSettings),
  reducer, isTerminal, component: JellyJarTossGame,
};
