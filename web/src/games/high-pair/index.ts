import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { HighPairState, HighPairAction, HighPairSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { HighPairGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const highPairPlugin: GamePlugin<HighPairState, HighPairAction, typeof settings> = {
  id:"high-pair", title:"High Pair", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Two cards per round. Pair? Score (rank - 1). Higher pairs score the most. 8 rounds.",
  howToPlay:`High Pair is a quick card mini that rewards pulling rank. Each round you deal two cards; if they share a rank, you score points equal to that rank minus 1. So a pair of Aces (rank 14) is worth 13 points — the maximum — Kings score 12, Queens 11, all the way down to a pair of twos worth just 1 point.

If your cards do not share a rank, you score nothing for the round. There are 8 rounds total, with the deck refreshing between deals so each is independent.

The probability of any pair on two cards is roughly 1 in 17 — so most rounds you'll come up dry. But the few times the deck smiles on you with paired royalty, the points stack fast. A theoretical perfect game (eight pairs of Aces) would total 104, but in practice anything above zero is a win.

Press Deal to flip your cards, then Next to advance. Average scores cluster near 0-12; high rollers hit 30+.`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as HighPairSettings),
  reducer,isTerminal,component:HighPairGame,
};
