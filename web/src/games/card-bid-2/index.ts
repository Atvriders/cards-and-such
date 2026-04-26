import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardBid2State, CardBid2Action, CardBid2Settings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CardBid2Game } from "./Game.js";
const settings = { rounds: { kind:"enum" as const, label:"Rounds", options:["8","12"] as const, default:"8" as const } } as const;
type S = SettingsOf<typeof settings>;
export const cardBid2Plugin: GamePlugin<CardBid2State, CardBid2Action, typeof settings> = {
  id:"card-bid-2", title:"Card Bid 2", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"A compact higher-or-lower card betting game. Start with 50 coins and bet wisely over 8 or 12 rounds.",
  howToPlay:`Card Bid 2 is a fast higher-or-lower betting card game. You start with 50 coins. Each round you see a face-up card, choose an amount to bet, and predict whether the next card will be higher or lower.

A correct guess wins your bet. A wrong guess loses it. Equal ranks are a tie — no coins change hands.

Cards rank from 2 (low) to Ace (high). Suits don't affect rank. Use the current card value to inform your bet size — if it's a 2, higher is very likely safe; if it's an Ace, lower is the smart call.

Press Next after each reveal. The game ends when rounds run out or your coins hit zero.

Your final coin total is your score. Choose 8 or 12 rounds in Settings for a quicker or longer session. Can you double your starting coins in just 8 rounds?`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CardBid2Settings),
  reducer,isTerminal,component:CardBid2Game,
};
