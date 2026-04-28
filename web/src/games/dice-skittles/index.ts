import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceSkittlesState, DiceSkittlesAction, DiceSkittlesSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceSkittlesGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceSkittlesPlugin: GamePlugin<DiceSkittlesState, DiceSkittlesAction, typeof settings> = {
  id:"dice-skittles", title:"Dice Skittles", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"British skittles, 9 pins, 12 ends.",
  howToPlay:"Dice Skittles models the traditional English pub game. Skittles uses nine wooden pins arranged in a diamond, knocked down by a heavy cheese-shaped wooden disc rolled or thrown along an alley. Each end (round) you get two throws, then count fallen pins.\n\nIn this mini each of 12 ends you Roll two dice. The end's score is the sum minus 2, capped between 0 and 9 (since only nine pins are up per end). Average end yields around 5 pins; a typical match totals near 60, and a strong run clears 80. The maximum, all 9s, is 108.\n\nSkittles is the ancestor of all modern pin-bowling sports and still played in pubs across the West Country, the Midlands and parts of Wales. Some leagues take it very seriously. This mini is a stripped-down rhythmic version — Roll, Next, repeat — that captures the steady cadence of an evening of pub skittles in about a minute.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceSkittlesSettings),
  reducer,isTerminal,component:DiceSkittlesGame,
};
