import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { RedOrBlackState, RedOrBlackAction, RedOrBlackSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const RedOrBlack = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.RedOrBlack as unknown as React.ComponentType<unknown> })));
const settings = {
  rounds: { kind: "enum" as const, label: "Rounds", options: ["10", "20", "30"] as const, default: "10" as const },
} as const;

type S = SettingsOf<typeof settings>;

export const redOrBlackPlugin: GamePlugin<RedOrBlackState, RedOrBlackAction, typeof settings> = {
  id: "red-or-black",
  title: "Red or Black",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Guess red or black for each hidden card. Use the tracking panel to know how many of each color remain!",
  howToPlay: `Red or Black is a card prediction game with a memory edge. Each round a card is hidden face down. Guess Red (hearts and diamonds) or Black (spades and clubs).

Unlike pure luck games, the scoreboard shows how many red and black cards remain in the deck based on what you have seen so far. Use this information strategically! If 20 black cards have been drawn but only 10 red, the odds favor red on the next card.

A correct guess earns 10 points. A wrong guess earns nothing. The deck is a standard shuffled 52-card deck with 26 red and 26 black cards.

Choose 10, 20, or 30 rounds in Settings. The remaining card counts update after each reveal so you can track the probabilities. Even a 10-round game can reward careful counting.

Your final score is shown at the end. Think carefully and use the odds — that is the whole game!`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as RedOrBlackSettings),
  reducer, isTerminal, hint: (state: RedOrBlackState): HintTarget | null => ((state.phase === "betting" || state.phase === "reveal" || state.phase === "result") ? { selector: ".bet-btn", pulses: 3 } : null), component: RedOrBlack,
};
