import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { Game2048State, Game2048Action, Game2048Settings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Game2048Game } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const game2048Plugin: GamePlugin<Game2048State, Game2048Action, typeof settings> = {
  id:"game-2048", title:"2048 Match", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Power-of-two themed match-3 with a 60-second clock.",
  howToPlay:"2048 Match is a sixty-second match-three with a power-of-two theme. The six-by-six grid is filled with tiles representing the iconic 2, 4, 8, 16, 100, and bullseye sequence. Click two adjacent tiles to swap them. Whenever a swap creates a horizontal or vertical run of three or more matching tiles, those numbers clear for ten points each. New tiles fall in from above and frequently trigger cascade chains for big bonus points. Invalid swaps cancel without using a turn. Where the original 2048 is about merging in cardinal directions, this match-three variant rewards lateral thinking and cascade prediction. With six symbols, matches happen at a steady clip but high scores require chasing four- and five-in-a-row clears. The clock counts down sixty seconds at the top. Average runs land at 300-400 points; cascade masters clear 500+. When the timer expires, your final score is locked in!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as Game2048Settings),
  reducer,isTerminal,component:Game2048Game,
};
