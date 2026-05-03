import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CiceraState, CiceraAction, CiceraSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const CiceraGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.CiceraGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const ciceraPlugin: GamePlugin<CiceraState, CiceraAction, typeof settings> = {
  id: "cicera", title: "Cicera", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Italian Scopa variant: capture matching cards from CPU.",
  howToPlay: "Cicera is an Italian regional Scopa variant from the Tuscany area where a special \"double-capture\" rule allows pairing a hand card with multiple table cards of the same rank. This mini-version simulates the double-capture energy with a slightly elevated per-round payout.\n\nEach round, you and the CPU each draw one card. Higher rank wins (a successful capture). Aces high (13), twos low (1). Suit is irrelevant.\n\nScoring: round win awards 12 points. Tie awards 4 sympathy points. Loss awards zero.\n\nNine rounds total. Expected score: 50-70 points; lucky runs reach 80+.\n\nIn real Cicera, the multi-capture mechanic creates strategic tension: do you sweep the table fast (good for winning the deal-end \"scopa\" bonus) or slowly (good for keeping options open)? This mini-version skips that decision-tree and offers fast, no-decision rounds with a hint of Tuscan flavor. Cards are drawn fresh each round so duplicates aren't possible — clean, simple, and quick.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CiceraSettings),
  reducer, isTerminal, hint: (state: CiceraState): HintTarget | null => (state.phase === "ready" ? { selector: '[data-testid="hint-target-cicera-primary"]', pulses: 3 } : null), component: CiceraGame,
};
