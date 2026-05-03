import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { ParkingPuzzleState, ParkingPuzzleAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const ParkingPuzzle = /* @__PURE__ */ lazy(() => import("./ParkingPuzzle.js").then((mod) => ({ default: mod.ParkingPuzzle as unknown as React.ComponentType<unknown> })));
const parkingPuzzleSettings = {
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "medium", "hard"] as const,
    default: "medium" as const,
  },
} as const;

export const parkingPuzzlePlugin: GamePlugin<ParkingPuzzleState, ParkingPuzzleAction, typeof parkingPuzzleSettings> = {
  id: "parking-puzzle",
  title: "Parking Puzzle",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Slide cars in a crowded parking lot to let the red car escape.",
  howToPlay: `A red car is trapped in a crowded parking lot. Your goal is to slide the other cars out of the way so the red car can drive out through the exit on the right side.

Click any car to select it (it glows with a white outline). Then use the Left/Right buttons for horizontal cars, or the Up/Down buttons for vertical cars, to move the selected car one step at a time. Cars can only move in the direction they are oriented — horizontal cars slide left or right, vertical cars slide up or down. A car cannot move through another car or off the board.

The puzzle is solved when the red car reaches the right edge and exits.

Tips: work backward from the red car. Identify which cars are blocking it, then figure out which cars block those blockers. Longer chains of dependency make harder puzzles. Sometimes you need to move a car in the wrong direction first to create space elsewhere. Minimize total moves for a higher score.`,
  settings: parkingPuzzleSettings,
  initialState,
  reducer,
  isTerminal,
  hint: (): HintTarget | null => (typeof document !== "undefined" && document.querySelector(".parking-board")) ? { selector: ".parking-board", pulses: 3 } : null,
  component: ParkingPuzzle,
};
