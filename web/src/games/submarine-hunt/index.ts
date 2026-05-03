import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SubmarineHuntState, SubmarineHuntAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SubmarineHunt } from "./SubmarineHunt.js";

export const submarineHuntSettings = {
  gridSize: {
    kind: "enum" as const,
    label: "Ocean size",
    options: ["8", "10", "12"] as const,
    default: "10" as const,
  },
  submarines: {
    kind: "enum" as const,
    label: "Submarines",
    options: ["3", "4", "5"] as const,
    default: "4" as const,
  },
} as const;

type SubmarineHuntSettingsType = SettingsOf<typeof submarineHuntSettings>;

export const submarineHuntPlugin: GamePlugin<SubmarineHuntState, SubmarineHuntAction, typeof submarineHuntSettings> = {
  id: "submarine-hunt",
  title: "Submarine Hunt",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Search the ocean grid and sink all hidden submarines with depth charges.",
  howToPlay: `Hidden submarines lurk beneath the ocean surface. Your mission is to sink every one of them by firing depth charges at grid squares.

Click any blue square to drop a depth charge. A direct hit lights up orange (💥). When every cell of a submarine is hit, the whole vessel sinks and turns dark red (🚢). A missed shot shows a small dot marker.

Submarines are 2 or 3 cells long, placed horizontally or vertically. They do not touch each other, which gives you a clue about nearby empty water once you spot one.

Scoring rewards both accuracy and speed: each sunken submarine is worth 100 points, but every missed shot deducts 5. To maximize your score, hunt methodically. Start by spacing shots across the grid in a checkerboard pattern to cover as much area as possible. Once you get a hit, probe adjacent cells along the axis to find the full length before moving on.

Larger ocean grids and more submarines extend the challenge significantly. A perfect game on a 12×12 grid with 5 submarines requires disciplined tracking.`,
  settings: submarineHuntSettings,
  initialState: (seed: number, settings: SubmarineHuntSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any)?.phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any)?.gameOver === true || (s as any)?.done === true) return null; return { selector: ".sub-cell", pulses: 3 }; },
  component: SubmarineHunt,
};
