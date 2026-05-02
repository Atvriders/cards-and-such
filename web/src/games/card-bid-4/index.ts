import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardBid4State, CardBid4Action, CardBid4Settings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CardBid4Game } from "./Game.js";
const settings = { rounds: { kind:"enum" as const, label:"Rounds", options:["8","12"] as const, default:"8" as const } } as const;
type S = SettingsOf<typeof settings>;
export const cardBid4Plugin: GamePlugin<CardBid4State, CardBid4Action, typeof settings> = {
  id:"card-bid-4", title:"Card Bid 4", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"A higher-or-lower card betting game with 4x win multiplier. Start with 200 coins!",
  howToPlay:`In Card Bid 4, correct predictions pay out 4 times your bet. Start with 200 coins, choose a bet, then predict higher or lower. A correct call wins 4x your amount. Wrong guesses lose the bet. Equal ranks are a tie. Suit does not matter. Choose 8 or 12 rounds in Settings. Your final coin total is your score — use the generous 4x payout to build a massive stack!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CardBid4Settings),
  reducer,isTerminal,hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-card-bid-4-primary"]', pulses: 3 }), component:CardBid4Game,
};
