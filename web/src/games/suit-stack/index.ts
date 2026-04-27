import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SuitStackState, SuitStackAction, SuitStackSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SuitStackGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const suitStackPlugin: GamePlugin<SuitStackState, SuitStackAction, typeof settings> = {
  id:"suit-stack", title:"Suit Stack", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Draw 8 cards; score 5 points each time the new card matches the previous suit.",
  howToPlay:`Suit Stack rewards lucky streaks. Eight cards will be drawn one at a time, all displayed in a row. After every draw past the first, if the new card's suit matches the previous card's suit, you score 5 points and the streak grows. If it doesn't match, the streak resets to 1 — but no points are subtracted.

Each card is drawn fresh from a shuffled 52-card deck so the chance of matching the previous suit is 1 in 4. Average expected scores hover near 8 to 10 points; runs that score 20+ points mean you've stacked a few same-suit chains. Hitting all eight cards in the same suit would max out at 35 points — pure fortune.

Just press Draw eight times. Watch the streak counter grow when the suits cooperate, and try to coax a long run out of the cards. There's nothing to choose, just lucky chains to enjoy!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as SuitStackSettings),
  reducer,isTerminal,component:SuitStackGame,
};
