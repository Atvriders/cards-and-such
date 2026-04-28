import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SashiganeState, SashiganeAction, SashiganeSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SashiganeGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
export const sashiganePlugin: GamePlugin<SashiganeState, SashiganeAction, typeof settings> = {
  id: "sashigane",
  title: "Sashigane",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Divide grid into L-shaped regions. Each L contains exactly one circle indicating the L's bend or end position.",
  howToPlay: "Sashigane carves the grid into L-shaped regions, each L being a 1-cell-wide bent strip. Within each L there's exactly one circled cell. The circle's position depends on the puzzle: in some variants it marks the L's bent corner; in others it marks one of the L's ends, and a number gives the L's total length.\n\nTogether the rules force a unique division of the grid into Ls. The puzzle is in the polyomino-tiling family but feels distinct because L's vary in size.\n\nEach puzzle shows a small grid with circles and (optionally) length numbers. A target cell is highlighted with four candidate region IDs (which L does this cell belong to?) or shape descriptors. Apply the L-shape rule and circle markers to deduce the answer.\n\nSix puzzles per round; 100 points per correct answer plus a time bonus. Wrong picks reveal the correct region. Sashigane is one of the more underrated Nikoli puzzles — the L-shape constraint is elegant and the deductions chain nicely.",
  settings,
  initialState: (seed: number) => initialState(seed, { dummy: true } as SashiganeSettings),
  reducer,
  isTerminal,
  component: SashiganeGame,
};
