import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { GearPuzzleState, GearPuzzleAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { GearPuzzle } from "./GearPuzzle.js";

const gearPuzzleSettings = {
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "medium", "hard"] as const,
    default: "easy" as const,
  },
} as const;

export const gearPuzzlePlugin: GamePlugin<GearPuzzleState, GearPuzzleAction, typeof gearPuzzleSettings> = {
  id: "gear-puzzle",
  title: "Gear Puzzle",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Place gears on the grid to form a chain from the input to the output.",
  howToPlay: `Gears on a grid transmit rotation to any adjacent gear (horizontally or vertically). An input gear (blue) drives the system. Your goal is to place gears so that rotation travels through a connected chain from the input to the output gear (orange).

Select a gear size from the toolbar at the top — small or large. Then click any empty slot to place a gear there. Click a placed gear to remove it. Fixed gears (darker border) are already positioned and cannot be moved.

Two gears are connected if they occupy adjacent slots. The chain is connected when you can trace a path of adjacent gears from the input to the output. When the chain is complete, all connected gears turn green.

You have a limited number of each gear size. Use them wisely — you don't need to fill every slot, just create an unbroken path.

Tips: plan the shortest path from input to output first. Gears can change direction through any sequence of adjacent slots. On harder puzzles the grid is larger and fixed gears create obstacles you must route around.`,
  settings: gearPuzzleSettings,
  initialState,
  reducer,
  isTerminal,
  hint: (): HintTarget | null => (typeof document !== "undefined" && document.querySelector(".gear-grid")) ? { selector: ".gear-grid", pulses: 3 } : null,
  component: GearPuzzle,
};
