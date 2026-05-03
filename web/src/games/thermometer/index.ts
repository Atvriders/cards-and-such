import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ThermometerState, ThermometerAction, ThermometerSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const Thermometer = /* @__PURE__ */ lazy(() => import("./Thermometer.js").then((mod) => ({ default: mod.Thermometer as unknown as React.ComponentType<unknown> })));
export const thermometerSettings = {
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "medium", "hard"] as const,
    default: "easy",
  },
} as const;

type ThermometerSettingsType = SettingsOf<typeof thermometerSettings>;

export const thermometerPlugin: GamePlugin<ThermometerState, ThermometerAction, typeof thermometerSettings> = {
  id: "thermometer",
  title: "Thermometer Puzzle",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Fill thermometers with mercury so each row and column hits its target count.",
  howToPlay: `Thermometer Puzzle (also called Thermometers) is a logic puzzle featuring thermometer shapes drawn across a grid. Each thermometer is a connected chain of cells with a round bulb at one end and a flat tip at the other. Mercury fills a thermometer continuously from the bulb — you cannot skip cells, so if a cell is filled, all cells between it and the bulb must also be filled.

Row and column clues (numbers at the edges of the grid) tell you how many cells in that row or column are filled with mercury. Your job is to determine exactly which cells contain mercury so every row and column matches its clue.

Click a cell on a thermometer to fill mercury up to that point (or remove it). The mercury always rises from the bulb end, so clicking the Nth cell fills cells 1 through N. Click the same cell again to reduce the fill by one level.

Strategy: look for rows or columns with a clue of 0 — those thermometers that pass through are entirely empty. Full-row or full-column clues (equal to grid size) mean every cell is filled. Cross-reference multiple thermometers sharing a row or column to narrow down fill levels. Short thermometers give you less flexibility — solve them first.`,
  settings: thermometerSettings,
  initialState: (seed: number, settings: ThermometerSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver || (s as any).won || (s as any).isWon || (s as any).isComplete || (s as any).complete) return null; return { selector: '[data-testid="hint-target-thermometer-action"]', pulses: 3 }; },
  component: Thermometer,
};
