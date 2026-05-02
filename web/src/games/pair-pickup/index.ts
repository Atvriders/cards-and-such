import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PairPickupState, PairPickupAction, PairPickupSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PairPickupGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const pairPickupPlugin: GamePlugin<PairPickupState, PairPickupAction, typeof settings> = {
  id:"pair-pickup", title:"Pair Pickup", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Score per pair found in 12 random 5-card draws.",
  howToPlay:`Pair Pickup is a chill card mini built around finding matching ranks. Each round, you press Deal 5 and get five fresh cards from a random 52-card deck. Every pair of matching ranks earns you 75 points — and three of a kind counts as 3 pairs (since C(3,2) = 3), four of a kind counts as 6 pairs (450 points!), and so on.

You play 12 draws total. The probability of getting at least one pair on any given five-card draw from a fresh deck is just under 50%, so you'll see pairs in roughly half your hands. Triplets and quads are much rarer but worth far more — landing one is a thrill.

No decisions to make: just press Deal 5, watch the cards land, and see how many pairs the deck delivers. The match counter shows the breakdown each round, and after 12 draws your final score is locked in. Easy, satisfying, and randomly generous!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as PairPickupSettings),
  reducer,isTerminal,hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-pair-pickup-primary"]', pulses: 3 }),component:PairPickupGame,
};
