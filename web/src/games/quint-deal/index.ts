import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { QuintDealState, QuintDealAction, QuintDealSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { QuintDealGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const quintDealPlugin: GamePlugin<QuintDealState, QuintDealAction, typeof settings> = {
  id:"quint-deal", title:"Quint Deal", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Five cards are dealt face-up; tap the highest as fast as you can spot it. Aces high.",
  howToPlay:`Quint Deal is a fast card-recognition mini. Each round, five cards are dealt face-up. Your job: tap the card that has the highest rank. Aces are high. Suits don't matter — only rank. Each correct identification scores 10 points.

There are 10 rounds. Picking the right card every time would yield 100 points, the maximum. The challenge isn't math — it's pattern recognition under pressure. Some hands have a clear standout (an Ace next to four small cards); others are a tight cluster (a 9, 10, J, Q, K) where you have to look carefully.

If two cards tie for highest rank (different suits), tapping either of those would not match the lone canonical 'highest index' the game has stored, so consistent ties are unlikely but possible — call it a teaching moment.

Look quickly, tap accurately, and chase a perfect 100.`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as QuintDealSettings),
  reducer,isTerminal,hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-quint-deal-primary"]', pulses: 3 }),component:QuintDealGame,
};
