import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { CubeRollState, CubeRollAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const CubeRoll = /* @__PURE__ */ lazy(() => import("./CubeRoll.js").then((mod) => ({ default: mod.CubeRoll as unknown as React.ComponentType<unknown> })));
const cubeRollSettings = {
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "medium", "hard"] as const,
    default: "medium" as const,
  },
} as const;

export const cubeRollPlugin: GamePlugin<CubeRollState, CubeRollAction, typeof cubeRollSettings> = {
  id: "cube-roll",
  title: "Cube Roll",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Roll a die through a grid maze so the target face is on top at the goal.",
  howToPlay: `A die sits on a grid. Your task is to roll it from the start to the orange goal cell — but when you arrive, a specific face must be face-up.

Use the arrow buttons (or keyboard arrow keys) to roll the cube in any direction. Each roll tips the die 90 degrees, rotating all six faces according to standard dice rules. The top face shown in the current cell tells you which face is currently up.

The target face is displayed at the top of the screen. The goal cell shows which face you must have on top when you arrive there. You can approach the goal from different angles to change the orientation on arrival.

If you reach the goal but the wrong face is up, the puzzle is not yet solved — try rolling away and approaching from a different direction.

Walls are shown as dark borders between cells; you cannot roll through them.

Strategy tips: think several moves ahead. Opposite faces on a standard die always sum to seven (1–6, 2–5, 3–4). Rolling in a 4-step loop returns the die to its original orientation. Counting rotations along each axis helps you predict which face will be up at the destination.`,
  settings: cubeRollSettings,
  initialState,
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-cube-roll-action"]', pulses: 3 }; },
  component: CubeRoll,
};
