import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { HeyawakeState, HeyawakeAction, HeyawakeSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Heyawake } from "./Heyawake.js";

export const heyawakeSettings = {
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "hard"] as const,
    default: "easy",
  },
} as const;

type HeyawakeSettingsType = SettingsOf<typeof heyawakeSettings>;

export const heyawakePlugin: GamePlugin<HeyawakeState, HeyawakeAction, typeof heyawakeSettings> = {
  id: "heyawake",
  title: "Heyawake",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Shade cells in a room-divided grid: match room counts, no two shaded adjacent, unshaded stays connected.",
  howToPlay: `Heyawake (Japanese for "divided rooms") is a logic puzzle played on a grid divided into rectangular rooms. Some rooms show a number in their corner. Your goal is to shade cells according to three rules.

Rule 1 — Room counts: if a room has a number, exactly that many cells in the room must be shaded. Rooms without a number can have any number of shaded cells.

Rule 2 — No adjacency: no two shaded cells may be orthogonally adjacent to each other (diagonal touching is fine).

Rule 3 — Connectivity: all unshaded cells must form a single connected group. Additionally, no straight horizontal or vertical line of unshaded cells may pass through two or more room boundaries.

Click a cell to cycle it through: empty → shaded (black) → dot (·, just a reminder) → empty. The dot mark is a helper — it doesn't count as shaded. Room clue numbers turn green when the shaded count matches.

Strategy: start with rooms numbered 0 (no shading) to immediately clear all cells. For numbered rooms, use the adjacency rule to force cells. The connectivity and boundary-crossing rules often eliminate the remaining possibilities.`,
  settings: heyawakeSettings,
  initialState: (seed: number, settings: HeyawakeSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver || (s as any).won || (s as any).isWon || (s as any).isComplete || (s as any).complete) return null; return { selector: '[data-testid="hint-target-heyawake-action"]', pulses: 3 }; },
  component: Heyawake,
};
