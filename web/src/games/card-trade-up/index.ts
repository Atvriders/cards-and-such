import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardTradeUpState, CardTradeUpAction, CardTradeUpSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CardTradeUpGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const cardTradeUpPlugin: GamePlugin<CardTradeUpState, CardTradeUpAction, typeof settings> = {
  id: "card-trade-up", title: "Card Trade Up", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Trade up to higher-rank cards over 12 turns.",
  howToPlay: `Card Trade Up is a quick decision-making card game. You start with one card in hand and a candidate card on the table. Each round you choose: Trade (replace your card with the candidate) or Keep (discard the candidate, hold your card).

Scoring is delta-based on your trades. If you trade up — the candidate's rank is higher than your current card's rank — you score +5 points. If you trade down (candidate is lower), you lose 5 points. Equal-rank trades score 0. Choosing Keep is always 0 points; it's the safe play.

A new candidate is dealt every round, so even if you keep a King, the next candidate could be an Ace. There are 12 trades per game. Aces are highest, then K, Q, J, 10, 9, ..., 2. The game tracks your net delta; final score is the maximum of your net delta and 0 (you can't end below zero).

Strategy: trade aggressively when your current card is low. Keep when you already have a King or Ace. Maximum theoretical score is 60 points (12 trades x 5).`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CardTradeUpSettings),
  reducer, isTerminal,
  hint: (state: any) => {
    if (state.phase === "done") return null;
    return { selector: '[data-testid="hint-target-card-trade-up-trade"]', pulses: 3 };
  }, component: CardTradeUpGame,
};
