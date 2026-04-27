import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DualDealState, DualDealAction, DualDealSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DualDealGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const dualDealPlugin: GamePlugin<DualDealState, DualDealAction, typeof settings> = {
  id:"dual-deal", title:"Dual Deal", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Bet which of two dealt cards will be higher, twelve rounds in a row.",
  howToPlay:`Dual Deal is a 50/50 high-card mini. Each round, you predict whether the Left card or the Right card will be the higher rank. Then two cards are dealt face-up. Aces are high; ranks tie regardless of suit.

If your prediction matches reality, you score 10 points. If the two ranks tie, the round is a Push and earns 0 points (this happens roughly 6% of the time, since after picking the first card there are 3 of the same rank left in 51 cards).

There are 12 rounds. Without prior information, picking left or right is purely 50/50, so expected scores hover around 60. Streaky luck can push a great game past 100 — and a bad run can leave you below 40.

The pure randomness keeps things light. Trust your gut, click left or right, and see how the cards break.`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DualDealSettings),
  reducer,isTerminal,component:DualDealGame,
};
