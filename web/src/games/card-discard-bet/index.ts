import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardDiscardBetState, CardDiscardBetAction, CardDiscardBetSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const CardDiscardBet = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.CardDiscardBet as unknown as React.ComponentType<unknown> })));
const settings = { rounds: { kind:"enum" as const, label:"Rounds", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const cardDiscardBetPlugin: GamePlugin<CardDiscardBetState, CardDiscardBetAction, typeof settings> = {
  id: "card-discard-bet", title: "Card Discard Bet", category: "cards",
  players: { min:1, max:1, multiplayer:false },
  description: "Keep a card and score its rank, or discard it and score double the next card's rank.",
  howToPlay: `Card Discard Bet is a risk-reward mini-game. Each round you see one face-up card from a shuffled deck. You have two choices: Keep it and earn points equal to its rank value (Aces = 14, Kings = 13, down to 2s = 2), or Discard it and draw the next card — earning double that card's rank value.

The gamble: a 5 in the hand scores 5 points. But discard it and you might reveal a King for 26 points — or a 2 for only 4. The expected value slightly favors discarding on low cards.

Play over 10 or 20 rounds, accumulating points. The player who makes smart decisions about when to gamble and when to play it safe will finish with the highest score.

Settings let you choose the number of rounds. A different seed means a different deck order each game!`,
  settings,
  initialState: (seed:number, s:S) => initialState(seed, s as CardDiscardBetSettings),
  reducer, isTerminal,
  hint: (state: any) => {
    if (state.phase === "gameover") return null;
    if (state.phase === "result") return { selector: '[data-testid="hint-target-card-discard-bet-next"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-card-discard-bet-keep"]', pulses: 3 };
  }, component: CardDiscardBet,
};
