import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { NumberLinkMiniState, NumberLinkMiniAction, NumberLinkMiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { NumberLinkMiniGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
export const numberLinkMiniPlugin: GamePlugin<NumberLinkMiniState, NumberLinkMiniAction, typeof settings> = {
  id: "number-link-mini",
  title: "Number Link Mini",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Connect matching number pairs with non-overlapping orthogonal paths covering all cells.",
  howToPlay: "Number Link Mini (Arukone) places pairs of numbers in a small grid. Your task: draw paths that connect matching pairs through cells, with paths going orthogonally only, never crossing or branching, and (in strict Number Link) covering every cell of the grid.\n\nEach pair forms a single chain from one numeral to its twin. With multiple pairs in a small grid, the puzzle becomes about routing — finding the right zigs and zags so all cells fill exactly once.\n\nEach puzzle shows a small grid with pair endpoints. A target cell is highlighted with four candidates: 1, 2, 3, or 4 representing which pair-chain owns that cell. Reason about the routing to find the unique answer.\n\nSix puzzles per round; 100 points per correct answer plus a time bonus. Wrong picks reveal the correct chain identifier. Number Link is among the most visually pleasing logic puzzles — the final \"every cell colored\" board looks like a piece of art.",
  settings,
  initialState: (seed: number) => initialState(seed, { dummy: true } as NumberLinkMiniSettings),
  reducer,
  isTerminal,
  component: NumberLinkMiniGame,
};
