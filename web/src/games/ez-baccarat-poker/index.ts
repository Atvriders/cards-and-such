import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { EzBaccaratPokerState, EzBaccaratPokerAction, EzBaccaratPokerSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { EzBaccaratPokerGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const ezBaccaratPokerPlugin: GamePlugin<EzBaccaratPokerState, EzBaccaratPokerAction, typeof settings> = {
  id:"ez-baccarat-poker", title:"EZ Baccarat-Poker Hybrid", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Solo EZ Baccarat-Poker: deal five cards in a baccarat-style flow and score with poker hand rankings.",
  howToPlay:"EZ Baccarat-Poker Hybrid is a casino curiosity that applies poker hand rankings to a baccarat-style draw flow — players experience the dramatic single-card reveals of baccarat, but the payout depends on traditional poker hand strength. This solo edition simplifies further: deal five cards from a fresh 52-card deck and score under the standard hand-rank table.\n\nPress Deal each round to receive five random cards. Hand values: High Card 0, Pair 10, Two Pair 30, Three of a Kind 50, Straight 70, Flush 80, Full House 100, Four of a Kind 150, Straight Flush 200.\n\nThere are ten independent rounds. Picture each deal as a baccarat-style reveal where the suspense is the build-up, but the payout is poker. With only five cards, pairs are common and big hands are rare, so each round where you stumble into trips or a flush is genuinely exciting. Press Next between rounds and pile up your strongest possible cumulative score across the full hybrid session.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as EzBaccaratPokerSettings),
  reducer, isTerminal,   hint: (state: EzBaccaratPokerState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "deal") return { selector: '[data-testid="hint-target-ez-baccarat-poker-deal"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-ez-baccarat-poker-next"]', pulses: 3 };
    return null;
  },
  component:EzBaccaratPokerGame,
};
