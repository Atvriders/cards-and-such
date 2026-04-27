import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardClockBuildState, CardClockBuildAction, CardClockBuildSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CardClockBuildGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const cardClockBuildPlugin: GamePlugin<CardClockBuildState, CardClockBuildAction, typeof settings> = {
  id:"card-clock-build", title:"Card-Clock Build", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Build a 12-hour clock by placing drawn cards on matching rank slots.",
  howToPlay:`Card-Clock Build is a fast solitaire-style placement puzzle. Imagine a clock face with twelve slots numbered 1 through 12. You draw cards one at a time from a shuffled 52-card deck and try to place each one in the slot matching its rank.

Mapping: Ace = 1, 2 = 2, ... 10 = 10, Jack = 11, Queen = 12. Kings have no matching slot — when one is drawn, you have to Skip it (no penalty).

Each correctly placed card earns 10 points. You may Skip any drawn card at any time, but you'll never get a second chance — once skipped, that card is gone. The game ends when all 12 slots are filled or the deck runs out.

Maximum theoretical score is 120 points — twelve perfect placements. Most runs land 60-90 because some slots fill before the matching card appears. The earlier you fill a slot, the safer your score. Quick decision-making and luck rule the day!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CardClockBuildSettings),
  reducer,isTerminal,component:CardClockBuildGame,
};
