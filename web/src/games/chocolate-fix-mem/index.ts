import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { chocolateFixMemState, chocolateFixMemAction, chocolateFixMemSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const chocolateFixMemGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.chocolateFixMemGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const chocolateFixMemPlugin: GamePlugin<chocolateFixMemState, chocolateFixMemAction, typeof settings> = {
  id: "chocolate-fix-mem",
  title: "Chocolate Fix",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Deduction grid logic puzzle — fill 3x3 chocolate boxes correctly.",
  howToPlay: "Chocolate Fix is a deduction logic puzzle distilled to fifteen 3x3-grid recognition rounds. Each round presents a partial grid clue and asks you to identify which arrangement satisfies all clues.\n\nThe pool of chocolate-piece challenges includes Square truffles in a row, Round candies on the diagonal, Triangle pieces clustered in corners, and other grid-arrangement patterns. Each correct answer scores ten points; max 150.\n\nClick an arrangement, press Submit to lock, then Next to advance. The original Chocolate Fix is a single-player deduction puzzle with chocolate-themed pieces and a small box of clue cards; this distillation preserves the deduction-by-grid-pattern recognition without the physical pieces. Strong puzzlers score 130+; logic experts hit perfect 150.\n\nUse it as a quick deduction warmup or as a substitute for tactile grid puzzles when you want a calm digital experience. The key skill is reading the clue, eliminating impossible arrangements, and confirming the one valid configuration.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as chocolateFixMemSettings),
  reducer,
  isTerminal,
  
  hint: (state: chocolateFixMemState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-chocolate-fix-mem-answer-0"]', pulses: 3 } : null,component: chocolateFixMemGame,
};
