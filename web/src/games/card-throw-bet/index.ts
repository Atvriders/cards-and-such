import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardThrowBetState, CardThrowBetAction, CardThrowBetSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const CardThrowBetGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.CardThrowBetGame as unknown as React.ComponentType<unknown> })));
const settings = { rounds: { kind:"enum" as const, label:"Rounds", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const cardThrowBetPlugin: GamePlugin<CardThrowBetState, CardThrowBetAction, typeof settings> = {
  id: "card-throw-bet", title: "Card Throw Bet", category: "cards",
  players: { min:1, max:1, multiplayer:false },
  description: "Bet on whether the thrown card will be red or black — simple and fast!",
  howToPlay: `Card Throw Bet is a classic color-guessing betting game. Each round a card is drawn from a virtual deck. Before the reveal, bet Red or Black and choose your stake — 5, 10, or 20 coins.

Win your bet amount if your color is correct; lose it if wrong. Red and black are exactly equal in a standard deck, so this is a true 50/50 each round.

Start with 100 coins and play over 10 or 20 rounds. Careful bankroll management — don't go too big early — gives you the best chance of finishing with a healthy total!`,
  settings,
  initialState: (seed:number, s:S) => initialState(seed, s as CardThrowBetSettings),
  reducer, isTerminal, hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-card-throw-bet-primary"]', pulses: 3 }), component: CardThrowBetGame,
};
