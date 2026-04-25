import type { GamePlugin } from "../../platform/game-plugin/types.js";
import { initialState, reducer, isTerminal, type HalloweenPumpkinState, type HalloweenPumpkinAction } from "./state.js";
import { HalloweenPumpkinGame } from "./Game.js";

const settings = {
  size: {
    kind: "enum" as const,
    label: "Grid Size",
    options: ["4", "5", "6"] as const,
    default: "5" as const,
  },
} as const;

export const halloweenPumpkinPlugin: GamePlugin<HalloweenPumpkinState, HalloweenPumpkinAction, typeof settings> = {
  id: "halloween-pumpkin",
  title: "Halloween Pumpkin",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Carve your pumpkin to exactly match the spooky stencil pattern!",
  howToPlay: `Halloween Pumpkin is a pattern-copying puzzle. You are given a stencil — a grid showing which cells should be carved (dark) and which should remain solid (orange). Your job is to carve your pumpkin so it matches the stencil as closely as possible.

Click any cell on your pumpkin to toggle it between carved (dark) and uncarved (orange). Compare your work to the stencil panel on the left. When you are satisfied with your carving, press the Submit button.

Your score is calculated based on accuracy — the percentage of cells that exactly match the stencil — multiplied by a speed bonus that decreases slightly with each toggle. A perfect match scores up to 1000 points.

Strategy: start by quickly setting all cells that clearly need to be carved, then refine the details. Every extra toggle reduces your speed bonus, so try to make deliberate choices rather than toggling back and forth.

Settings let you choose 4×4, 5×5, or 6×6 grids. Larger grids are harder to match precisely but offer more complexity.`,
  settings,
  initialState,
  reducer,
  isTerminal,
  component: HalloweenPumpkinGame,
};
