import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { CalSpeedState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const CaliforniaSpeed = /* @__PURE__ */ lazy(() => import("./CaliforniaSpeed.js").then((mod) => ({ default: mod.CaliforniaSpeed as unknown as React.ComponentType<unknown> })));
export const calSpeedSettings = {
  botReaction: {
    kind: "enum" as const,
    label: "Bot Reaction",
    options: ["slow", "medium", "fast"] as const,
    default: "medium" as const,
  },
} as const;

type CalSpeedAction =
  | { type: "flip" }
  | { type: "slap" }
  | { type: "bot-flip" }
  | { type: "bot-slap" }
  | { type: "restart" };

export const californiaSpeedPlugin: GamePlugin<CalSpeedState, CalSpeedAction, typeof calSpeedSettings> = {
  id: "california-speed",
  title: "California Speed",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Flip cards onto the table and SLAP any matching pair before the bot does.",
  howToPlay: `California Speed is a fast reaction card game played between two people with a single deck.

Setup: the 52-card deck is dealt evenly — 26 cards to you and 26 to the bot. Each player also places two cards face-up on their side of the table (four table cards total).

Gameplay: click Flip Card to place your top card onto one of your two table slots. The bot then automatically flips a card onto its side of the table. After each flip, scan all four table cards for any two that share the same rank — across any position on the table.

Matching: when two table cards share a rank (any pair, including across sides), they glow and a SLAP window opens. Click SLAP! as fast as you can to capture those two cards before the bot does. The matched cards are removed from the table and refilled from both players' decks.

Winning: the first player to empty both their deck and their table slots wins the round.

Bot: the bot reacts to matches automatically based on the Reaction Speed setting. Fast bots react in under half a second; slow bots give you over a second to react.

Tips: keep your eyes on the table, not on your hand. Matches can appear on cards you both play, so every flip is a potential slap opportunity.`,
  settings: calSpeedSettings,
  initialState,
  reducer,
  isTerminal,
  hint: (state: any) => {
    if (state.phase === "slap-window") return { selector: '[data-testid="hint-target-california-speed-slap"]', pulses: 3 };
    if (state.phase === "waiting") return { selector: '[data-testid="hint-target-california-speed-flip"]', pulses: 3 };
    return null;
  },
  component: CaliforniaSpeed,
};
