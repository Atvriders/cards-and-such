import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SuguruMiniState, SuguruMiniAction, SuguruMiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SuguruMiniGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
export const suguruMiniPlugin: GamePlugin<SuguruMiniState, SuguruMiniAction, typeof settings> = {
  id: "suguru-mini",
  title: "Suguru Mini",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Fill each region with 1-N where N is the region size; cells touching (orthogonally OR diagonally) cannot share a digit.",
  howToPlay: "Suguru Mini, also called Tectonic, fills small regions with consecutive digits starting from 1. A region with N cells contains digits 1 through N, each exactly once. Crucially, no two cells touching — orthogonally OR diagonally — may share the same digit, even if they're in different regions.\n\nThe diagonal-touch rule is what gives Suguru its character. A 1 in one region forbids 1 from up to eight neighbor cells. Combined with regions of mixed sizes (often 1-5), the constraints chain quickly.\n\nEach puzzle shows a small grid divided into colored regions. A target cell is highlighted with four candidate digits. Use the region-size rule (digits 1-N) plus the touch rule to find the unique value.\n\nSix puzzles per round; 100 points per correct answer plus a 10-point-per-second time bonus. Wrong answers reveal the correct value. Suguru is great for a quick logic fix — bite-sized but never trivial.",
  settings,
  initialState: (seed: number) => initialState(seed, { dummy: true } as SuguruMiniSettings),
  reducer,
  isTerminal,
  component: SuguruMiniGame,
};
