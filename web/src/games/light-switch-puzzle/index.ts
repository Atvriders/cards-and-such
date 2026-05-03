import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { LightSwitchState, LightSwitchAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { LightSwitchGame } from "./Game.js";

const lightSwitchSettings = {
  size: {
    kind: "number" as const,
    label: "Grid size",
    min: 3,
    max: 5,
    step: 1,
    default: 4,
  },
} as const;

type S = SettingsOf<typeof lightSwitchSettings>;

export const lightSwitchPuzzlePlugin: GamePlugin<LightSwitchState, LightSwitchAction, typeof lightSwitchSettings> = {
  id: "light-switch-puzzle",
  title: "Light Switch Puzzle",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Toggle switches to match the target light pattern.",
  howToPlay: `Light Switch Puzzle presents two grids side by side. The left grid shows your current pattern of lights (on or off). The right grid shows the target pattern you must match.

Clicking a light on the current grid toggles that light and all of its orthogonal neighbors (up, down, left, right) simultaneously. Edge and corner lights have fewer neighbors and are therefore easier to use as pivot points.

Your goal is to make the current pattern exactly match the target pattern. Because toggling spreads to neighbors, you must think ahead about how each click affects surrounding lights.

Three grid sizes are available: 3×3 (9 lights, beginner), 4×4 (16 lights, standard), and 5×5 (25 lights, challenging). The puzzle is always generated to be solvable.

Score starts at 500 and decreases by 10 for each toggle made, with a floor of 50. Try to find the minimum number of toggles needed.

Tip: Work from one corner outward. Toggle a corner to fix it, then use the edge below/beside it to fix the next cell, keeping corrections local. This systematic approach minimises wasted moves.`,
  settings: lightSwitchSettings,
  initialState: (seed: number, settings: S) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (): HintTarget | null => (typeof document !== "undefined" && document.querySelector(".light-switch-grid")) ? { selector: ".light-switch-grid", pulses: 3 } : null,
  component: LightSwitchGame,
};
