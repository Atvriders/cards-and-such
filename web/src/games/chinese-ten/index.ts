import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ChineseTenState, ChineseTenAction, ChineseTenSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const ChineseTenGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.ChineseTenGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const chineseTenPlugin: GamePlugin<ChineseTenState, ChineseTenAction, typeof settings> = {
  id: "chinese-ten", title: "Chinese Ten", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Adding-to-10 shedding/fishing variant with simple capture rules.",
  howToPlay: "Chinese Ten is a simple capture-style shedding card game where players match cards from their hand with cards on the table that sum to ten. Numerical cards (2-8) capture cards summing to ten with them; tens, jacks, queens, and kings capture matching ranks. Captured cards score points: aces, jacks, queens, kings each score one or two points; tens of diamonds or hearts score special bonuses. In this one-on-one CPU duel across six rounds, click Play Round to deal eight-card hands and resolve the captures. Strategy: hold low cards (2-8) until you see a complementary high card on the table, then capture for the ten-sum. Save kings and queens for matching captures of high-value royal cards. Aim for at least three rounds where you out-capture the CPU. A total score above seventy is a respectable Chinese Ten finish.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ChineseTenSettings),
  reducer, isTerminal,
  hint: (state: any) => {
    if (state.phase === "ready") return { selector: '[data-testid="hint-target-chinese-ten-primary"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-chinese-ten-next"]', pulses: 3 };
    return null;
  }, component: ChineseTenGame,
};
