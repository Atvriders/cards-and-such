import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { FarkleFullState, FarkleFullAction } from "./state.js";
import { initialState, reducer, isTerminal, scoreSelection } from "./state.js";

const FarkleFullGame = /* @__PURE__ */ lazy(() =>
  import("./Game.js").then((m) => ({
    default: m.FarkleFullGame as unknown as React.ComponentType<unknown>,
  })),
);

export const farkleFullSettings = {
  target: {
    kind: "enum" as const,
    label: "Target Score",
    options: ["5000", "10000"] as const,
    default: "10000",
  },
  cpuRisk: {
    kind: "enum" as const,
    label: "CPU Style",
    options: ["cautious", "balanced", "aggressive"] as const,
    default: "balanced",
  },
} as const;

type FarkleFullSettingsType = SettingsOf<typeof farkleFullSettings>;

export const farkleFullPlugin: GamePlugin<
  FarkleFullState,
  FarkleFullAction,
  typeof farkleFullSettings
> = {
  id: "farkle-full",
  title: "Farkle (Full Push-Your-Luck)",
  category: "dice",
  players: { min: 1, max: 2, multiplayer: false },
  description:
    "Push your luck rolling 6d6: bank the points or risk the farkle.",
  howToPlay: `Farkle is a head-to-head push-your-luck dice game. You and the CPU take turns rolling six dice and racing to the target score (default 10,000).

On your turn: press Roll, then click each scoring die you want to keep and press Set aside. Each die you set aside must be part of a scoring combination — single 1s and 5s, triples, four/five/six of a kind, the 1-2-3-4-5-6 straight, three pairs, or two triplets all qualify. After setting aside, you can roll the remaining dice again to push for more points, or Bank to lock in your turn total and pass to the CPU.

Scoring (per turn, additive): single 1 = 100, single 5 = 50; three 1s = 1000; three of any other face = 100 x face; four of a kind doubles the triple, five quadruples, six is x8. Special 6-die rolls: straight 1-6 = 1500, three pairs = 1500, two triplets = 2500.

Hot dice: if you set aside all six dice in a turn, you get all six back and can keep rolling. Farkle: if a roll produces no scoring dice at all, you lose every point you accumulated that turn — bank often if you're worried!

First side to reach the target wins. CPU style (cautious / balanced / aggressive) controls how greedy your opponent gets before banking.`,
  settings: farkleFullSettings,
  initialState: (seed: number, settings: FarkleFullSettingsType) =>
    initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: FarkleFullState): HintTarget | null => {
    if (isTerminal(state) !== null) return null;
    // Hints only for the human player.
    if (state.current !== 0) return null;
    if (state.phase === "preRoll") {
      if (state.turnScore >= 350) {
        return { selector: '[data-testid="ff-bank"]', pulses: 3 };
      }
      return { selector: '[data-testid="ff-roll"]', pulses: 3 };
    }
    if (state.phase === "farkled") {
      return { selector: '[data-testid="ff-next"]', pulses: 3 };
    }
    if (state.phase === "rolled") {
      // Pulse the first single-die scorer (a 1 or a 5) we find.
      for (let i = 0; i < state.roll.length; i++) {
        const v = state.roll[i]!;
        if (scoreSelection([v]) > 0) {
          return { selector: `[data-testid="ff-die-${i}"]`, pulses: 3 };
        }
      }
      // Otherwise pulse the Set aside button as a hint to confirm the pick.
      return { selector: '[data-testid="ff-setaside"]', pulses: 3 };
    }
    return null;
  },
  component: FarkleFullGame,
  themeOverrides: {
    feltGradient: "linear-gradient(135deg, #4d2f12, #7a4a1c 50%, #2b1607)",
    accent: "rgba(240, 182, 87, 0.55)",
  },
};
