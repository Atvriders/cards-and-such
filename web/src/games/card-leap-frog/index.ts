import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardLeapFrogState, CardLeapFrogAction, CardLeapFrogSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CardLeapFrogGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const cardLeapFrogPlugin: GamePlugin<CardLeapFrogState, CardLeapFrogAction, typeof settings> = {
  id:"card-leap-frog", title:"Card Leap Frog", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Cards leap by 2 ranks. Even-rank cards win the leap. 10 rounds.",
  howToPlay:"Card Leap Frog is a tiny card-flip mini. You get 10 rounds. Each round, draw a card and watch it 'leap' across the lily pads. Even-numbered cards (2, 4, 6, 8, 10, Q) successfully cross and earn you 10 points. Odd-numbered cards (3, 5, 7, 9, J, K, A) miss the leap.\n\nThe split is roughly 50/50 — 24 cards out of 52 are even-leapers (counting Queens as 12 = even). Across 10 rounds, average expected scores are around 50 points; a streak of even cards can boost you near 100.\n\nThere's no skill needed — just press Draw, watch the leap, and see if your card crosses the lily pads. After each result, press Next to continue. The score totals at the end. It's a clean, casual coin-flip-style game with a frog twist!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CardLeapFrogSettings),
  reducer,isTerminal,component:CardLeapFrogGame,
};
