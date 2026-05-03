import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardCleanSweepState, CardCleanSweepAction, CardCleanSweepSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const CardCleanSweepGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.CardCleanSweepGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const cardCleanSweepPlugin: GamePlugin<CardCleanSweepState, CardCleanSweepAction, typeof settings> = {
  id: "card-clean-sweep", title: "Card Clean Sweep", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Sweep all face cards from a 26-card pile. 4 rounds.",
  howToPlay: `Card Clean Sweep is a simple draw-and-tally card game. Each round, you're dealt a 26-card pile (a random half-deck). Press Draw to flip the top card; you'll see it for a moment, then move on. There's no input beyond Draw — just empty the pile.

Scoring is straightforward. Every non-face card (2 through 10, plus Aces) is worth 1 point. Every face card (Jack, Queen, King) is worth 15 points. If, by the time the pile is exhausted, you've found every face card that was in this round's pile, you earn a clean-sweep bonus of 50 points. Since face cards are highlighted with a gold glow when drawn, it's easy to keep mental track of how many you have left.

There are 4 rounds, with a fresh shuffled half-deck each time. The total face cards in any 26-card draw averages 6 (out of 12 in a deck), so most rounds you'll see 4-8 face cards.

Maximum realistic score is around 600+ points across all 4 rounds.`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CardCleanSweepSettings),
  reducer, isTerminal, hint: (state: CardCleanSweepState): HintTarget | null => (state.phase === "drawing" ? { selector: '[data-testid="hint-target-card-clean-sweep-primary"]', pulses: 3 } : null), component: CardCleanSweepGame,
};
