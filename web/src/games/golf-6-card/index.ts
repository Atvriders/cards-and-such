import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { Golf6CardState, Golf6CardAction, Golf6CardSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const Golf6CardGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.Golf6CardGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const golf6CardPlugin: GamePlugin<Golf6CardState, Golf6CardAction, typeof settings> = {
  id: "golf-6-card", title: "Golf (6-Card)", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Lowest total wins — swap face-down cards intelligently.",
  howToPlay: "Golf (6-Card) is a shedding-style card game where each player is dealt six cards face-down arranged in a 2x3 grid and may peek at two of them at the start. On each turn you draw from stock or discard, then either swap with one of your face-down cards or discard. Pairs of equal-rank cards in the same column score zero (cancel out). Aces score one, two through ten score face value, jacks/queens score ten, kings score zero. The goal is to minimize your total — like golf, the lowest score wins. The round ends when one player flips all six cards, after which others get one final turn. In this one-on-one CPU duel across six rounds, click Play Round. Strategy: aim for column-pair cancels to minimize score, and do not flip your last card until you are sure your total is below the CPU's. Aim for at least three round wins and a final cumulative score under negative twenty for an excellent finish.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as Golf6CardSettings),
  reducer, isTerminal, hint: (state: Golf6CardState): HintTarget | null => (state.phase === "ready" ? { selector: '[data-testid="hint-target-golf-6-card-primary"]', pulses: 3 } : null), component: Golf6CardGame,
};
