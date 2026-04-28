import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceNinepinBowlState, DiceNinepinBowlAction, DiceNinepinBowlSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceNinepinBowlGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceNinepinBowlPlugin: GamePlugin<DiceNinepinBowlState, DiceNinepinBowlAction, typeof settings> = {
  id:"dice-ninepin-bowl", title:"Dice Nine-Pin Bowl", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"European 9-pin variant — 9 rounds, 1d10 pins.",
  howToPlay:"Nine-Pin Dice Bowl is a European-style ninepin sim using a single ten-sided distribution simulated by two d6 averaged. Each of the 9 rounds you Roll to knock down between 0 and 9 pins; we cap at 9 because nine-pin only has nine pins. The frame total is added to your score.\n\nExpected per-frame is around 4.5 pins, so a typical game lands near 40. A clean run can clear 60, and a perfect 9-pins-every-frame would yield 81 — the absolute maximum.\n\nNine-pin bowling is still played in central Europe, especially Germany and Austria, with diamond-shaped pin layouts and slightly heavier balls than American ten-pin. This dice version compresses the entire match into 9 quick presses of Roll. No spares, no strikes — just one toss per frame, totalled for a ninepin score. Great as a fast tabletop bowling break.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceNinepinBowlSettings),
  reducer,isTerminal,component:DiceNinepinBowlGame,
};
