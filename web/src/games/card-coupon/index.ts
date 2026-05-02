import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardCouponState, CardCouponAction, CardCouponSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CardCouponGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const cardCouponPlugin: GamePlugin<CardCouponState, CardCouponAction, typeof settings> = {
  id:"card-coupon", title:"Card Coupon", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Each card's value is discounted by 1 — low totals win across 10 draws.",
  howToPlay:`Card Coupon is a low-value card chase across 10 draws. Each draw flips a single random card, and its "coupon value" is its rank minus 1: 2 becomes 1, 3 becomes 2, ..., 10 becomes 9, J becomes 10, Q becomes 11, K becomes 12, and Ace's friendly 1 drops all the way to 0.

The trick: low coupons score MORE points. The formula is 12 minus the coupon value, capped at 0. So an Ace's coupon of 0 scores 12 points; a 2's coupon of 1 scores 11 points; while a King's coupon of 12 scores 0 points.

There's no decision — just keep drawing. Across 10 draws, average totals fall around 50-65 points. Lucky runs full of Aces and twos can crack 100; bad streaks dominated by face cards may finish under 30.

Press Draw to flip the next card. The deck is infinite (cards may repeat), so each draw is fully independent. Hunt those low ranks!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CardCouponSettings),
  reducer,isTerminal,hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-card-coupon-primary"]', pulses: 3 }), component:CardCouponGame,
};
