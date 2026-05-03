import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { WelcomeMoonState, WelcomeMoonAction, WelcomeMoonSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const WelcomeMoonGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.WelcomeMoonGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const welcomeMoonPlugin: GamePlugin<WelcomeMoonState, WelcomeMoonAction, typeof settings> = {
  id: "welcome-moon",
  title: "Welcome to the Moon",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Lunar Welcome — colonize numbered craters in ascending order.",
  howToPlay: `Welcome to the Moon is a strict-ascending placement dice game.

How to play
1. Press Roll for a d12.
2. Place the number into any slot in any of the 3 rows of 5 — but each row must remain strictly ascending.
3. Place gives die value + adjacency bonus (+2 if a neighbor is exactly one less or more).
4. Skip if no legal slot — costs −1 to score.

Theme: Lunar bases: pairs of 11 grant +5.

End-of-game bonuses
- Each completed row: +6
- Full board: +10

Game ends after 12 rolls or when all 15 slots are filled. Strong runs reach 60-100.`,
  settings,
  initialState: (seed, s) => initialState(seed, s as WelcomeMoonSettings),
  reducer,
  isTerminal,
  hint: (state) => {
    const phase = (state as any).phase;
    if (phase === "rolling") return { selector: '[data-testid="hint-target-welcome-moon-roll"]', pulses: 3 };
    if (phase === "rolling-dice") return { selector: '[data-testid="hint-target-welcome-moon-roll"]', pulses: 3 };
    if (phase === "preRoll") return { selector: '[data-testid="hint-target-welcome-moon-roll"]', pulses: 3 };
    if (phase === "ready") return { selector: '[data-testid="hint-target-welcome-moon-roll"]', pulses: 3 };
    if (phase === "playerRoll") return { selector: '[data-testid="hint-target-welcome-moon-roll"]', pulses: 3 };
    if (phase === "roll") return { selector: '[data-testid="hint-target-welcome-moon-roll"]', pulses: 3 };
    if (phase === "play") return { selector: '[data-testid="hint-target-welcome-moon-roll"]', pulses: 3 };
    if (phase === "playing") return { selector: '[data-testid="hint-target-welcome-moon-roll"]', pulses: 3 };
    if (phase === "placing") return { selector: '[data-testid="hint-target-welcome-moon-place"]', pulses: 3 };
    if (phase === "place") return { selector: '[data-testid="hint-target-welcome-moon-place"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-welcome-moon-roll"]', pulses: 3 };
  },
  component: WelcomeMoonGame,
};
