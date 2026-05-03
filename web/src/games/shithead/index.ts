import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ShitheadState, ShitheadAction, ShitheadSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const ShitheadGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.ShitheadGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const shitheadPlugin: GamePlugin<ShitheadState, ShitheadAction, typeof settings> = {
  id: "shithead", title: "Shithead", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Three-tier shedding game with face-up table cards and hand cards.",
  howToPlay: "Shithead, also called Karma or Palace, is a popular pub shedding game where each player has three tiers of cards: three face-down cards (untouched until the end), three face-up cards on top of those, and a hand of three cards drawn from the deck. Players play hand cards first, drawing back to three until the deck is exhausted, then face-up cards, finally face-down cards. You must play higher than the top discard, with special powers for 2s (reset), 10s (burn the pile), and four-of-a-kind also burning. In this one-on-one CPU duel across six rounds, click Play Round to simulate. Strategy: save 10s and 2s for emergencies, and pick face-up table cards that are very high (kings, aces) since you commit to them. Last to empty all three tiers loses (becomes the shithead). Aim to win at least three rounds for a strong score.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ShitheadSettings),
  reducer, isTerminal,
  hint: (state: any) => {
    if (state.phase === "ready") return { selector: '[data-testid="hint-target-shithead-primary"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-shithead-next"]', pulses: 3 };
    return null;
  }, component: ShitheadGame,
};
