import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardDiscardDownState, CardDiscardDownAction, CardDiscardDownSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const CardDiscardDownGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.CardDiscardDownGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const cardDiscardDownPlugin: GamePlugin<CardDiscardDownState, CardDiscardDownAction, typeof settings> = {
  id: "card-discard-down", title: "Card Discard Down", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Discard cards from a 5-card hand to lower its total. 10 rounds.",
  howToPlay: `Card Discard Down is a "lower is better" card mini. Each round, you're dealt a 5-card hand. You can select up to 2 cards to discard; replacements are drawn from the deck. Then your hand is scored on the sum of pip values: 2-10 face value, J/Q/K each count as 10, Ace counts as 1.

You score (50 minus your final hand sum), clamped to a minimum of 0. So a hand summing to 15 scores 35 points; a hand summing to 30 scores 20; a hand summing to 50+ scores 0. Lower hand sum = better score. Aces are gold (each one is just 1 pip), and 2s and 3s are likewise good. Tens, Jacks, Queens, and Kings hurt — discard those if you can.

You don't have to discard if you're already happy. Just press Discard & Draw with no cards selected. There are 10 rounds. Maximum theoretical score with luck and Aces is roughly 380+ points.

Strategy: prioritize discarding the highest-pip cards. With Aces around, a perfect 5-Ace finish is theoretically possible (sum = 5, score = 45 per round).`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CardDiscardDownSettings),
  reducer, isTerminal, hint: (state: CardDiscardDownState): HintTarget | null => (state.phase === "selecting" ? { selector: '[data-testid="hint-target-card-discard-down-primary"]', pulses: 3 } : null), component: CardDiscardDownGame,
};
