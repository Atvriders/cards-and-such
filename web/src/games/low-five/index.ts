import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { LowFiveState, LowFiveAction, LowFiveSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { LowFiveGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const lowFivePlugin: GamePlugin<LowFiveState, LowFiveAction, typeof settings> = {
  id:"low-five", title:"Low Five", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Five-card low-sum game — lower totals score more across 8 rounds.",
  howToPlay:`Low Five is a 'low score wins' card game. Each round, five cards are dealt face-up. Sum their pip values: 2 through 10 face value, Jack 11, Queen 12, King 13, and Ace 1.

Lower sums score more points. Sum 15 or under nets 50 points. 16-20 nets 30. 21-25 nets 15. 26-30 nets 5. Anything 31 or higher scores zero.

The expected average sum of five random cards is around 35, so most rounds will score zero — but when the deck deals you Aces, 2s, 3s, 4s, and 5s, you can hit jackpot rounds.

There's no choice in the game — just deal and tally. Across 8 rounds, average expected scores hover around 30-50 points, with lucky games reaching 100+. Watch those Aces appear and cheer when the small cards stack in your favor!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as LowFiveSettings),
  reducer,isTerminal,hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-low-five-primary"]', pulses: 3 }),component:LowFiveGame,
};
