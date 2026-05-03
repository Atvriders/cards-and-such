import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MangoPokerState, MangoPokerAction, MangoPokerSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MangoPokerGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const mangoPokerPlugin: GamePlugin<MangoPokerState, MangoPokerAction, typeof settings> = {
  id:"mango-poker", title:"Mango Poker Solo", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Solo Mango Poker; Asian variant with rotating active position.",
  howToPlay:"Mango Poker Solo simulates the Asian community-card variant where the active community card rotates each street, creating shifting equity calculations from one phase to the next. Press Deal each round to receive six cards (a hybrid hole-plus-shared layout) and the engine evaluates the best five-card poker hand among all 15 possible combinations.\n\nHand values: High Card 0, Pair 10, Two Pair 30, Three of a Kind 50, Straight 70, Flush 80, Full House 100, Four of a Kind 150, Straight Flush 200. Eight rounds total — each a fresh Mango deal.\n\nLive Mango Poker rotates which community card is currently 'active' for hand combinations. The rotating mechanic creates dynamic equity shifts as the streets unfold and forces players to plan combos that survive every rotation phase. Here, the rotating-mechanic abstraction yields a six-card draw evaluated as best-five. Press Next to enjoy eight Mango rounds and stack up the aggregate score!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as MangoPokerSettings),
  reducer,isTerminal,component:MangoPokerGame,
  hint: (state: MangoPokerState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "deal") return { selector: '[data-testid="hint-target-mango-poker-deal"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-mango-poker-next"]', pulses: 3 };
    return null;
  },
};
