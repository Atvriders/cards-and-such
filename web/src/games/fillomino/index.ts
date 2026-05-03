import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { FillominoState, FillominoAction, FillominoSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Fillomino } from "./Fillomino.js";

export const fillominoSettings = {
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "hard"] as const,
    default: "easy",
  },
} as const;

type FillominoSettingsType = SettingsOf<typeof fillominoSettings>;

export const fillominoPlugin: GamePlugin<FillominoState, FillominoAction, typeof fillominoSettings> = {
  id: "fillomino",
  title: "Fillomino",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Fill every cell with a number: each region's size must equal its number, and same-size regions can't touch.",
  howToPlay: `Fillomino is a number-placement puzzle. Every cell in the grid must contain a positive integer. The numbers define regions: all cells that share the same number and are connected orthogonally form one region, and the size of that region (the number of cells) must equal the number written in those cells. For example, a region of three connected cells would all contain the digit 3.

The key constraint is that two regions of equal size may not touch each other orthogonally — two different groups of "4" cells cannot share an edge.

Some cells are given (pre-filled and shown in bold). Use them as anchors. Select a cell by clicking it, then press a number button on the pad (or keyboard 1–9) to enter a value. Press ⌫ to clear your entry. Given cells cannot be changed.

Strategy: given cells that are already isolated force the region to grow in specific directions. Look for cells where only one size fits without creating illegal same-size adjacency. Work from the edges inward, and confirm regions as you complete them — a confirmed region of N should have exactly N connected cells, each showing N.`,
  settings: fillominoSettings,
  initialState: (seed: number, settings: FillominoSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver || (s as any).won || (s as any).isWon || (s as any).isComplete || (s as any).complete) return null; return { selector: '[data-testid="hint-target-fillomino-action"]', pulses: 3 }; },
  component: Fillomino,
};
