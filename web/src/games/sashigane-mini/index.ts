import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SashiganeMiniState, SashiganeMiniAction, SashiganeMiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SashiganeMiniGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
export const sashiganeMiniPlugin: GamePlugin<SashiganeMiniState, SashiganeMiniAction, typeof settings> = {
  id: "sashigane-mini",
  title: "Sashigane Mini",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Draw L-shaped regions; ends of L marked by clue numbers.",
  howToPlay: "Sashigane is a Japanese L-shape puzzle (the name means \"carpenter's square\"). The grid is divided into L-shaped regions. Two cells in each L are clues: a circle marks one end of the L and an arrow marks the bend, with a number indicating the L's total cell count.\n\nIn this mini version each puzzle shows a small grid with a partially-drawn L. The prompt asks which cell completes the L given the constraints (size of L, arrow direction, ending circle).\n\nLs can vary in size (3+ cells) and orient any of the four ways (up-right, right-down, etc.). The L always has exactly two perpendicular arms; never a straight line. Reading the arrow tells you the bend direction; the circle marks the far end.\n\nSix puzzles per round, increasing in size and complexity. Scoring is 100 points per correct answer plus a 10-point time bonus per remaining second. Wrong picks reveal the correct cell. Sashigane builds spatial-reasoning skill — every puzzle reads like a tiny architectural diagram.",
  settings,
  initialState: (seed: number) => initialState(seed, { dummy: true } as SashiganeMiniSettings),
  reducer,
  isTerminal,
  component: SashiganeMiniGame,
};
