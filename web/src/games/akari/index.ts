import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { AkariState, AkariAction, AkariSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Akari } from "./Akari.js";

export const akariSettings = {
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "medium", "hard"] as const,
    default: "easy",
  },
} as const;

type AkariSettingsType = SettingsOf<typeof akariSettings>;

export const akariPlugin: GamePlugin<AkariState, AkariAction, typeof akariSettings> = {
  id: "akari",
  title: "Akari",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Place light bulbs to illuminate every white cell; no two bulbs may shine on each other.",
  howToPlay: `Akari (also called Light Up) is a Japanese logic puzzle played on a rectangular grid. Some cells are black walls; the rest are white. Your goal is to place light bulbs on white cells so that every white cell is illuminated.

Each bulb shines light outward in all four cardinal directions (up, down, left, right), illuminating every white cell it can reach until blocked by a black wall or the grid edge. Two rules constrain your placements: no two bulbs may illuminate each other — meaning no two bulbs can share an unobstructed row or column segment — and black walls that show a number (0–4) must have exactly that many bulbs placed in their four orthogonally adjacent cells.

Click any white cell to toggle a bulb on or off. Illuminated cells turn yellow. Bulbs that conflict with another bulb (line-of-sight) turn red — remove one to fix the conflict. Wall numbers help narrow where bulbs can legally go; a "0" wall means none of its four neighbors holds a bulb.

Strategy: start with 0-numbered walls (block out their neighbors) and constrained corners. Work outward, using illumination to identify which remaining white cells still need a bulb. The puzzle has a unique solution reachable by pure logic.`,
  settings: akariSettings,
  initialState: (seed: number, settings: AkariSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver || (s as any).won || (s as any).isWon || (s as any).isComplete || (s as any).complete) return null; return { selector: '[data-testid="hint-target-akari-action"]', pulses: 3 }; },
  component: Akari,
};
