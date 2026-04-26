import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TacoTossState, TacoTossAction, TacoTossSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TacoTossGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const tacoTossPlugin: GamePlugin<TacoTossState, TacoTossAction, typeof settings> = {
  id: "taco-toss", title: "Taco Toss", category: "arcade",
  players: { min:1, max:1, multiplayer:false },
  description: "Toss a taco through the air at the right angle to land it in the serving bowl!",
  howToPlay: `Taco Toss is an angle-based throwing game. Each round you need to find the perfect launch angle to toss a taco into a serving bowl at just the right trajectory.\n\nAdjust the Angle slider and press Go! Points depend on how close your angle is to the ideal for each round. The target angle varies subtly due to wind and distance changes.\n\n10 tosses per game. Study your results — how far off you were tells you which direction to correct. Master the arc and score big!`,
  settings,
  initialState: (seed:number, s:S) => initialState(seed, s as TacoTossSettings),
  reducer, isTerminal, component: TacoTossGame,
};
