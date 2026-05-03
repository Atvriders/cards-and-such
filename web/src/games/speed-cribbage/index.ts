import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SpeedCribbageState, SpeedCribbageAction, SpeedCribbageSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const SpeedCribbageGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.SpeedCribbageGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
const hint = (state: SpeedCribbageState): HintTarget | null => {
  if (isTerminal(state)) return null;
  if (state.phase === "ready") return { selector: '[data-testid="hint-target-speed-cribbage-primary"]', pulses: 3 };
  if (state.phase === "result") return { selector: '[data-testid="hint-target-speed-cribbage-secondary"]', pulses: 3 };
  return null;
};

export const speedCribbagePlugin: GamePlugin<SpeedCribbageState, SpeedCribbageAction, typeof settings> = {
  id: "speed-cribbage", title: "Speed Cribbage", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Time-pressured Cribbage cut: rapid 12 turns of the deck.",
  howToPlay: "Speed Cribbage races through a dozen quick cut comparisons with no time for thinking — purely luck. Each round, you and the CPU each cut a single card from a 52-card deck. Higher rank wins.\n\nScoring: cut win pegs 7 points. Tie pegs 2 sympathy points. Loss pegs zero. There are twelve rounds in total, designed to feel like a frantic blitz session.\n\nAces count low (1), Kings count high (13). Suit has no bearing on the result. Cards are drawn from a freshly shuffled deck each round, so duplicates within a single round are impossible.\n\nExpected total: 45-65 points (average win-rate is around half). A particularly hot deck can push 80 points. Speed Cribbage is the variant of Cribbage played with a clock or by instinct — players don't fully count their hands, they just play. This stripped version keeps that energy: tap, see, react, advance.\n\nExcellent for quick warm-ups before a longer cribbage session.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SpeedCribbageSettings),
  reducer, isTerminal, hint: hint, component: SpeedCribbageGame,
};
