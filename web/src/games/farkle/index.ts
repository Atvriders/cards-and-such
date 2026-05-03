import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { FarkleState, FarkleAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { scoreFarkleSelection } from "../../engines/dice/index.js";
const Farkle = /* @__PURE__ */ lazy(() => import("./Farkle.js").then((mod) => ({ default: mod.Farkle as unknown as React.ComponentType<unknown> })));
export const farkleSettings = {
  target: {
    kind: "enum" as const,
    label: "Target Score",
    options: ["5000", "10000"] as const,
    default: "10000",
  },
} as const;

type FarkleSettingsType = SettingsOf<typeof farkleSettings>;

export const farklePlugin: GamePlugin<FarkleState, FarkleAction, typeof farkleSettings> = {
  id: "farkle",
  title: "Farkle",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Roll 6 dice, set aside scoring dice, and bank points before you farkle!",
  howToPlay: `Race to the target score — 5000 or 10000 — in as few turns as possible by rolling dice and banking points without going bust.

Each turn starts with 6 dice. Click "Roll" to roll them all. Scoring combinations include: 1 = 100, 5 = 50, three of a kind = face value × 100 (three 1s = 1000), four/five/six of a kind multiply further, and straights score large bonuses. Select one or more dice that form a valid scoring combination to set them aside, then choose to roll the remaining dice or bank your accumulated turn score. Hot dice: if you set aside all 6 dice you get all 6 back and can keep rolling. Farkle: if a roll produces no scoring options at all, you lose every point accumulated that turn and play ends. Click "Next Turn" to continue after a farkle.

Scoring: your final score is max(0, 1000 − turns taken). Finishing in fewer turns gives a higher score. Reaching the target in 10 turns earns 990 points; 1000 turns earns 0.

Tips: early in a turn it pays to be aggressive and reroll; once you've built a large turn score the risk of losing it all grows — bank while you're ahead.`,
  settings: farkleSettings,
  initialState: (seed: number, settings: FarkleSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: FarkleState): HintTarget | null => {
    if (state.won) return null;
    const phase = state.currentTurn.phase;
    if (phase === "preRoll") {
      // If we have turn score banked, suggest banking; otherwise roll
      if (state.currentTurn.turnScore > 0) {
        return { selector: '[data-testid="hint-target-farkle-bank"]', pulses: 3 };
      }
      return { selector: '[data-testid="hint-target-farkle-roll"]', pulses: 3 };
    }
    if (phase === "farkled") {
      return { selector: '[data-testid="hint-target-farkle-next-turn"]', pulses: 3 };
    }
    if (phase === "rolled") {
      // Find the first individually-scoring die (a 1 or 5)
      for (let i = 0; i < state.lastRoll.length; i++) {
        const v = state.lastRoll[i]!.value;
        if (scoreFarkleSelection([v]) > 0) {
          return { selector: `[data-testid="hint-target-farkle-die-${i}"]`, pulses: 3 };
        }
      }
      // No single-die scores — pulse Set Aside button as a fallback
      return { selector: '[data-testid="hint-target-farkle-setaside"]', pulses: 3 };
    }
    return null;
  },
  component: Farkle,
  themeOverrides: {
    feltGradient: "linear-gradient(135deg, #6b3f1a, #8a5a2b 50%, #4a2810)",
    accent: "rgba(217, 119, 6, 0.45)",
  },
};
