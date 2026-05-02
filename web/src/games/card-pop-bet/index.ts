import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardPopBetState, CardPopBetAction, CardPopBetSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CardPopBetGame } from "./Game.js";
const settings = { rounds: { kind:"enum" as const, label:"Rounds", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const cardPopBetPlugin: GamePlugin<CardPopBetState, CardPopBetAction, typeof settings> = {
  id: "card-pop-bet", title: "Card Pop Bet", category: "cards",
  players: { min:1, max:1, multiplayer:false },
  description: "Bet Hi or Lo on a single card draw — above or below rank 7.",
  howToPlay: `Card Pop Bet is a quick betting game. Each round a card is drawn from a shuffled deck. Before the reveal, bet Hi (rank 7 or above) or Lo (below rank 7). Correct bets earn your wagered coins; wrong bets lose them. Start with 100 coins and try to grow your stack across 10 or 20 rounds. A smart consistent bettor ends far ahead. Choose your bet amount carefully — go big when confident!`,
  settings,
  initialState: (seed:number, s:S) => initialState(seed, s as CardPopBetSettings),
  reducer, isTerminal, hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-card-pop-bet-primary"]', pulses: 3 }), component: CardPopBetGame,
};
