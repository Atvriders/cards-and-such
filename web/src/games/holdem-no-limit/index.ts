import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { HoldemNoLimitState, HoldemNoLimitAction, HoldemNoLimitSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { HoldemNoLimitGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const holdemNoLimitPlugin: GamePlugin<HoldemNoLimitState, HoldemNoLimitAction, typeof settings> = {
  id:"holdem-no-limit", title:"Hold'em No-Limit Solo", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Solo Texas Hold'em No-Limit: deal seven cards (two hole + five board) and score the best five-card poker hand.",
  howToPlay:"Hold'em No-Limit Solo gives you the classic Texas Hold'em deal experience without the betting drama. Press Deal each round to receive seven random cards from a fresh 52-card deck — these stand in for your two hole cards plus the five-card community board.\n\nThe seven cards are evaluated by automatically picking the best five-card poker hand among all combinations. Hand values: High Card 0, Pair 10, Two Pair 30, Three of a Kind 50, Straight 70, Flush 80, Full House 100, Four of a Kind 150, Straight Flush 200.\n\nThere are eight rounds total, each one independent. Because Hold'em uses seven total cards, you'll see far more pairs, two-pair, and trips than in a five-card draw — typical scores climb fast.\n\nIn real No-Limit Hold'em the bet sizing is unbounded, meaning a single all-in can break a tournament; here the analog is the variance: a single straight flush can carry your whole session. Press Next after each round and chase that seven-card high score!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as HoldemNoLimitSettings),
  reducer,isTerminal,component:HoldemNoLimitGame,
};
