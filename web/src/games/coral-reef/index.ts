import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CoralReefState, CoralReefAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CoralReef } from "./CoralReef.js";

export const coralReefSettings = {
  size: {
    kind: "enum" as const,
    label: "Grid Size",
    options: ["4", "5", "6"] as const,
    default: "5" as const,
  },
} as const;

type CoralReefSettingsType = SettingsOf<typeof coralReefSettings>;

export const coralReefPlugin: GamePlugin<CoralReefState, CoralReefAction, typeof coralReefSettings> = {
  id: "coral-reef",
  title: "Coral Reef",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Click groups of identical reef tiles to collect them and clear the ocean grid.",
  howToPlay: `Coral Reef is a same-game style board puzzle set on a colourful ocean grid. The reef is filled with four types of tiles: coral (🪸), fish (🐟), seaweed (🌿), and precious pearls (🫧). Your goal is to clear as many tiles as possible by clicking connected groups.

Click any tile that is part of a group of two or more identical adjacent tiles (horizontally or vertically connected). The entire connected group is collected at once and those cells become empty. You cannot clear a single isolated tile.

The game ends when no more connected groups of two or more exist — or when the grid is completely cleared. Clearing the entire board is the ideal outcome and earns bonus points.

Scoring: each collected tile earns 10 points. Pearl tiles earn an extra 20 bonus points per pearl collected. A move efficiency bonus of up to 200 points is awarded for completing the board in fewer moves — 200 minus 5 per move taken. Total score is capped at 1000.

Grid sizes of 4×4, 5×5, and 6×6 offer increasing challenge. Larger grids have more tiles to collect but also more opportunities for large connected groups.

Tips: target the largest groups first for maximum efficiency. Pearl groups are rare but valuable — collect them in multi-tile groups whenever possible. Leaving small isolated clusters behind will prevent a perfect clear, so try to connect disparate groups before collecting them.`,
  settings: coralReefSettings,
  initialState: (seed: number, settings: CoralReefSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver || (s as any).won || (s as any).isWon || (s as any).isComplete || (s as any).complete) return null; return { selector: '[data-testid="hint-target-coral-reef-action"]', pulses: 3 }; },
  component: CoralReef,
};
