import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BlinkMatchState, BlinkMatchAction, BlinkMatchSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const BlinkMatchGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.BlinkMatchGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const blinkMatchPlugin: GamePlugin<BlinkMatchState, BlinkMatchAction, typeof settings> = {
  id: "blink-match", title: "Blink Match", category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Match by shape, color, or count to the center card.",
  howToPlay: "Blink Match adapts the speed-card classic where you pick a card matching the center by shape, color, or count. Each round shows a center card with three attributes (e.g., 'circle red x3') and four candidate cards. Exactly one shares at least one attribute and is the legal match. Tap it, hit Submit, score ten points if right. Fifteen rounds, maximum 150 points. The game generates legal matches on a single attribute (the others are deliberately mismatched) so distractors all fail every comparison. This makes the puzzle clean: scan each candidate against the center for shape, color, count — if any one matches, it is playable. The original Blink rewards reflexes; this digital version focuses on accurate comparison without time pressure. Beginners 80-110, veterans 130+. Hit Submit and Next to advance. Watch out: distractors are designed to share NO attribute with the center, so any single match wins.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as BlinkMatchSettings),
  reducer, isTerminal,
  hint: (state: BlinkMatchState) => {
    if (state.phase === "done" || state.submitted) return null;
    return { selector: ".blnkmtc-cell", pulses: 3 };
  },
  component: BlinkMatchGame,
};
