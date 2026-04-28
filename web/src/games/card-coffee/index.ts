import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardCoffeeState, CardCoffeeAction, CardCoffeeSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CardCoffeeGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const cardCoffeePlugin: GamePlugin<CardCoffeeState, CardCoffeeAction, typeof settings> = {
  id:"card-coffee", title:"Card Coffee", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Coffee shop mini — pair same-suit cards for flavor.",
  howToPlay:"Card Coffee turns the deck into a tiny pour-over bar. Twelve cards arrive two at a time. Each round you decide Take (brew it) or Skip (let it cool). Pair the right flavors — same suit cards pair like classic coffee blends.\n\nFinal scoring: 5 points per kept card, +20 per same-suit pair in your kept set, and a flat +25 bonus if you collect at least one of each suit (a fully balanced flight).\n\nSix rounds total (12 cards). Pick aggressively when you see a streak of same-suit cards, but watch the variety bonus — the flight bonus alone is worth more than a couple of pairs. Brew wisely!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CardCoffeeSettings),
  reducer,isTerminal,component:CardCoffeeGame,
};
