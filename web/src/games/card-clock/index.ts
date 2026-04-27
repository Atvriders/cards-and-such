import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardClockState, CardClockAction, CardClockSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CardClockGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const cardClockPlugin: GamePlugin<CardClockState, CardClockAction, typeof settings> = {
  id:"card-clock", title:"Card Clock", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Match the card to the clock hour. 12 hours; +60 per match.",
  howToPlay:"Card Clock is a 12-round draw-and-match mini themed around a clock face. Each round corresponds to an hour of the clock (1 through 12). Draw a card; if its rank matches the current hour (Ace=1, 2=2, ..., 10=10, Jack=11, Queen=12), you score 60 points. Kings are 'wild' — they always miss in this build.\n\nThere are 12 hours/draws total. With one matching rank per hour out of 13 (≈ 7.7% chance), you'll average about 1 match per game (≈ 60 points). Lucky runs that land 2 or even 3 matches are big scores; a perfect 12-for-12 would score the impossible-feeling 720 points.\n\nPress Draw, see the card, see if it matches the hour, then press Next. There's no skill, just suspense and the small thrill of a clean clock-hour match. A perfect chime-and-watch mini.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CardClockSettings),
  reducer,isTerminal,component:CardClockGame,
};
