import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardStackBetState, CardStackBetAction, CardStackBetSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const CardStackBet = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.CardStackBet as unknown as React.ComponentType<unknown> })));
const cardStackBetSettings = {
  rounds: { kind: "enum" as const, label: "Rounds", options: ["10", "15"] as const, default: "10" as const },
} as const;

type CardStackBetSettingsType = SettingsOf<typeof cardStackBetSettings>;

export const cardStackBetPlugin: GamePlugin<CardStackBetState, CardStackBetAction, typeof cardStackBetSettings> = {
  id: "card-stack-bet",
  title: "Card Stack Bet",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Bet whether the next card in the stack is higher or lower than the current one. Grow your coins or go bust!",
  howToPlay: `Card Stack Bet is a higher-or-lower betting game. A shuffled deck is dealt one card at a time. You see the current top card and must predict whether the next card will be higher or lower in rank.

Start with 100 coins. Each round, enter a bid amount and press Higher or Lower. If you predict correctly, you win your bid. A wrong guess loses it. A tie (equal rank) is a push — no coins lost or gained.

Card ranks go from 2 (lowest) to Ace (highest). Suits don't matter. Use the information you have — if the top card is a low 3, higher is very likely; if it's a King, lower is much safer.

Press Next after each reveal to advance to the next card. The game ends when rounds run out or you go broke.

Your final coin total is your score. Use Settings to choose 10 or 15 rounds. Can you double your starting coins?`,
  settings: cardStackBetSettings,
  initialState: (seed: number, settings: CardStackBetSettingsType) => initialState(seed, settings as CardStackBetSettings),
  reducer,
  isTerminal,
  hint: (state: CardStackBetState): HintTarget | null => (state.phase === "betting" ? { selector: '[data-testid="hint-target-card-stack-bet-primary"]', pulses: 3 } : null),
  component: CardStackBet,
};
