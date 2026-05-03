import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SubmarineSonarState, SubmarineSonarAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const SubmarineSonar = /* @__PURE__ */ lazy(() => import("./SubmarineSonar.js").then((mod) => ({ default: mod.SubmarineSonar as unknown as React.ComponentType<unknown> })));
export const submarineSonarSettings = {
  gridSize: {
    kind: "enum" as const,
    label: "Grid Size",
    options: ["6", "8", "10"] as const,
    default: "8",
  },
} as const;

type SubmarineSonarSettingsType = SettingsOf<typeof submarineSonarSettings>;

export const submarineSonarPlugin: GamePlugin<SubmarineSonarState, SubmarineSonarAction, typeof submarineSonarSettings> = {
  id: "submarine-sonar",
  title: "Submarine Sonar",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Ping the ocean grid to locate and sink a hidden submarine.",
  howToPlay: `Submarine Sonar is a deduction and luck game set on the high seas. A submarine is hiding somewhere in the grid — your mission is to find it by sending sonar pings to grid squares.

Click any unknown cell to send a ping. If the submarine occupies that cell you score a hit (shown in orange). If not, you get a miss (shown as a wave). The submarine occupies a continuous line of cells — either horizontal or vertical. Once every cell of the submarine has been hit, it sinks and the game ends.

Strategy: use the miss pattern to narrow down which rows and columns are submarine-free. Once you score a hit, ping adjacent cells in all four directions to trace the submarine's full length.

Grid Size changes the ocean area and submarine length: 6×6 uses a 3-cell sub, 8×8 uses a 4-cell sub, and 10×10 uses a 5-cell sub.

Scoring: you start at 100 and lose 5 points for every ping beyond the submarine's length. Sink it efficiently to maximise your score. Perfect play means sinking the sub with exactly as many pings as it has cells.`,
  settings: submarineSonarSettings,
  initialState: (seed: number, settings: SubmarineSonarSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-submarine-sonar-action"]', pulses: 3 }; },
  component: SubmarineSonar,
};
