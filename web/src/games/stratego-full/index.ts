import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { StrategoFullState, StrategoFullAction, StrategoFullSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";

const StrategoFullGame = /* @__PURE__ */ lazy(() =>
  import("./Game.js").then((m) => ({ default: m.StrategoFullGame as unknown as React.ComponentType<unknown> }))
);

const settings = {
  _dummy: { kind: "enum" as const, label: " ", options: ["x"] as const, default: "x" as const },
} as const;

type S = SettingsOf<typeof settings>;

export const strategoFullPlugin: GamePlugin<StrategoFullState, StrategoFullAction, typeof settings> = {
  id: "stratego-full",
  title: "Stratego (Full Classic)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Hidden-rank war game on a 10x10 board: capture the flag or eliminate all movable pieces.",
  howToPlay:
    "Stratego is a hidden-information war game for two armies of 40 pieces each. Your goal is to capture the enemy Flag — or leave the enemy with no movable pieces.\n\nSetup. Click 'Auto-Place Army' to randomly arrange your 40 pieces on your bottom four rows, or click a piece in the side palette and then click a square on your half of the board to place it manually. When all 40 are placed, press 'Start Game' to begin. The CPU has already arranged its own army (you can only see piece backs).\n\nPlay. Players alternate turns. On your turn, click one of your pieces, then click an adjacent empty square (orthogonal only) to move there. Scouts (rank 2) may move any number of squares in a straight line, like a chess rook. Two central 2x2 lakes are impassable.\n\nCombat. Move onto a square containing an enemy piece to attack. Both pieces reveal their rank. Higher rank wins; equal ranks both die. Special rules: a Bomb defeats any attacker except a Miner (rank 3), who safely defuses it. The Spy (rank 1) beats the Marshal (rank 10) — but only when the Spy is the attacker. Capturing the Flag wins the game instantly.\n\nFog of war. You see your own ranks always; enemy pieces are face-down until they fight (revealed pieces stay revealed). Use this asymmetry — send Scouts forward to learn enemy positions; protect your Flag with Bombs.\n\nWin: capture the enemy Flag, or leave the opponent with no movable pieces.\n\n(Advanced rules omitted: tournament two-square / chasing rule, full move-history rank deductions beyond a simple heuristic.)",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as unknown as StrategoFullSettings),
  reducer,
  isTerminal,
  hint: (state: StrategoFullState): HintTarget | null => {
    if (isTerminal(state) !== null) return null;
    if (state.phase === "setup") {
      // Suggest auto-fill if pile non-empty, else start
      if (state.setupPile.length > 0) {
        return { selector: '[data-testid="stratego-full-auto-place"]', pulses: 3 };
      }
      return { selector: '[data-testid="stratego-full-start"]', pulses: 3 };
    }
    if (state.phase === "playing" && state.turn === 0) {
      return { selector: '[data-testid="stratego-full-cell-9-0"]', pulses: 3 };
    }
    return null;
  },
  component: StrategoFullGame,
};
