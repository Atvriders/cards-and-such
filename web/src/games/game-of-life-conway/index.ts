import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { ConwayState, ConwayAction, ConwaySettings, GridSize } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const GameOfLifeConwayGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.GameOfLifeConwayGame as unknown as React.ComponentType<unknown> })));
const settings = {
  size: {
    kind: "enum" as const,
    label: "Grid size",
    options: ["8", "12", "16"] as const,
    default: "12",
  },
} as const;
type S = SettingsOf<typeof settings>;

export const gameOfLifeConwayPlugin: GamePlugin<ConwayState, ConwayAction, typeof settings> = {
  id: "game-of-life-conway",
  title: "Game of Life (Conway)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Conway's cellular automaton on a 12x12 grid (8/12/16 configurable). Toggle cells, step, run, watch patterns evolve.",
  howToPlay: `Conway's Game of Life is the most famous cellular automaton ever invented. This is a one-player interactive sim, not a quiz.

Survival rules on the grid:
— A live cell with 2 or 3 live neighbors stays alive.
— A live cell with fewer than 2 (lonely) or more than 3 (crowded) dies.
— A dead cell with exactly 3 live neighbors becomes alive.

How to play:
1. Click cells to toggle them, or seed a preset (Glider, Blinker, Pulsar, R-pentomino, Random).
2. Press Step to advance one generation, or Run to auto-step every 200ms (Run again to pause).
3. Clear wipes cells but keeps your peak. Reset starts a fresh run from zero.
4. Press Finish when you're happy with the run to lock in the score.

Your score is peak live cells x generations survived. Long-lived patterns score highest — a glider floats for many turns; the R-pentomino explodes chaotically; pulsar oscillates forever (period 3) on a 16x16 board.

Pick the grid size in settings (8/12/16). Pulsar needs at least 13 — on smaller boards a toad oscillator is substituted.`,
  settings,
  initialState: (seed: number, s: S) => {
    const sizeNum = (parseInt(s.size, 10) || 12) as GridSize;
    const cs: ConwaySettings = { size: sizeNum };
    return initialState(seed, cs);
  },
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".golconway-btn", pulses: 3 }; },
  component: GameOfLifeConwayGame,
};
