import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TensTallyState, TensTallyAction, TensTallySettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TensTallyGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const tensTallyPlugin: GamePlugin<TensTallyState, TensTallyAction, typeof settings> = {
  id:"tens-tally", title:"Tens Tally", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Score by drawing 10s; +50 per ten across 12 random 5-card draws.",
  howToPlay:"Tens Tally is a chilled-out card mini. Each round, you press Deal and get five fresh cards from a random 52-card deck. Every 10 in your hand earns 50 points \u2014 there are only four 10s in a deck, so you won't see them every round, but multi-ten hands are sweet.\n\nThis variant gives you 12 draws (instead of 10) at half the points per match \u2014 meaning the math works out similar to a King/Queen/Jack mini. With 4 tens in 52 cards and 5 cards per round, you'll average about 0.38 tens per hand, so a typical run ends in the 200-220 point range, with hot streaks pushing higher. Matched tens are highlighted in gold for easy spotting.\n\nNo strategy, no decisions \u2014 just push Deal, see what the deck delivers, and rack up the tens. Have fun!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as TensTallySettings),
  reducer,isTerminal,hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-tens-tally-primary"]', pulses: 3 }),component:TensTallyGame,
};
