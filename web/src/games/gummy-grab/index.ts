import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GummyGrabState, GummyGrabAction, GummyGrabSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { GummyGrabGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const gummyGrabPlugin: GamePlugin<GummyGrabState, GummyGrabAction, typeof settings> = {
  id: "gummy-grab", title: "Gummy Grab", category: "arcade",
  players: { min:1, max:1, multiplayer:false },
  description: "Grab gummy bears from a jar — set the right power to get the maximum handful!",
  howToPlay: `Gummy Grab has you reaching into a jar of gummy bears. Each round set the power slider — too light and you get few gummies, too strong and you knock the jar. The closer to the sweet spot, the more gummies (points) you grab. 10 rounds of sticky-fingered fun!`,
  settings,
  initialState: (seed:number, s:S) => initialState(seed, s as GummyGrabSettings),
  reducer, isTerminal, component: GummyGrabGame,
};
