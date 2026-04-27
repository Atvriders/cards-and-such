import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { RankCollectorState, RankCollectorAction, RankCollectorSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { RankCollectorGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const rankCollectorPlugin: GamePlugin<RankCollectorState, RankCollectorAction, typeof settings> = {
  id:"rank-collector", title:"Rank Collector", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Each round, collect cards of a specific rank. 13 rounds × 4 draws.",
  howToPlay:`Rank Collector is a fast 13-round rank-matching game — one round per rank, in random order. Each round, you're given a target rank (2 through Ace) and you draw 4 random cards. Each match scores +20 points; misses score zero. After 4 draws, the next rank target rolls in.

Across all 13 rounds, you'll see every rank from 2 to Ace exactly once. Each draw has a 4/52 = ~7.7% chance of matching, so finding even a single match per round is satisfying. Streaks of 2+ in a round are rare but generous (40+ pts).

Maximum score is 1040 (4 hits × 13 rounds × 20 pts). Realistic averages hover around 70-100. The full 13-round arc keeps the variety alive — every rank tested, every result independent.

Tap Draw to flip a card. Hits flash green; misses fade. Settle in for a classic rank-spotting session!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as RankCollectorSettings),
  reducer,isTerminal,component:RankCollectorGame,
};
