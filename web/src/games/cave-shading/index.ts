import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { CaveShadingState, CaveShadingAction, CaveShadingSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CaveShadingGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
export const caveShadingPlugin: GamePlugin<CaveShadingState, CaveShadingAction, typeof settings> = {
  id: "cave-shading",
  title: "Cave Shading",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Shade connected tetrominoes; one per region; no 2x2 monochrome.",
  howToPlay: "Cave Shading (a LITS variant) divides a grid into regions and asks you to shade exactly one tetromino in each region. The shape must be one of L, I, T, or S. All shaded cells must form one connected region (think of it as a single \"cave\").\n\nRules: one tetromino per region; all shaded cells connected orthogonally; no 2x2 block of all shaded cells; tetrominoes from adjacent regions must not be the same shape if they share an edge.\n\nIn this mini version each puzzle shows a small grid with regions outlined. The prompt asks which tetromino fits a particular region given constraints from already-placed tetrominoes.\n\nSix puzzles per round, scoring 100 points each plus a 10-point time bonus per remaining second. Wrong picks reveal the right shape.\n\nCave Shading rewards careful tetromino-recognition. Each region admits only specific tetromino-shape orientations, and the no-same-shape-adjacency rule narrows your options further. Patterns emerge: regions with awkward shapes often only fit S; long thin regions only fit I.",
  settings,
  initialState: (seed: number) => initialState(seed, { dummy: true } as CaveShadingSettings),
  reducer,
  isTerminal,
  component: CaveShadingGame,
};
