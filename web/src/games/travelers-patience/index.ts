import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { SoliState, SoliAction, SoliSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const SoliGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.SoliGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const travelersPatiencePlugin: GamePlugin<SoliState, SoliAction, typeof settings> = {
  id: "travelers-patience",
  title: "Travelers Patience",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Clock-style decision patience adapted as a 10-round seeded hand-builder.",
  howToPlay: "Travelers Patience is a flip-till-you-bust clock-layout single-deck classic, here adapted as a ten-round seeded hand-building puzzle. Each round you receive a fresh hand of five cards drawn from a single seeded deck. Choose Keep & Score to lock the hand and earn points for ascending runs (a four-card run pays sixteen, a five pays thirty), Discard Hand for a one-point consolation, or Swap to consume the next deck card and replace any one card in the hand without ending the round.\n\nScores compound across all ten rounds. A typical run lands somewhere between forty and one hundred ten total points; ratings are Pass below forty, Fair forty to seventy-nine, Good eighty to one hundred nineteen, and Excellent at one hundred twenty plus. The deck is fully seeded so the same starting seed produces the same card sequence — perfect for replay and sharing.\n\nThe travelers' decisions echo the original Clock Patience rule that lets you peek at flipped cards before committing the round. Plan your swaps carefully, and reach Excellent. Patience pays off.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SoliSettings),
  reducer,
  isTerminal,
  hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-travelers-patience-primary"]', pulses: 3 }), component: SoliGame,
};
