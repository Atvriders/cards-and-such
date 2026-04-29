import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { MeadowPathsState, MeadowPathsAction, MeadowPathsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MeadowPathsGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const meadowPathsPlugin: GamePlugin<MeadowPathsState, MeadowPathsAction, typeof settings> = {
  id: "meadow-paths",
  title: "Meadow: Paths",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Card-tableau nature game with paths connecting habitats.",
  howToPlay: "Meadow is a card-tableau nature game where paths connect different habitats. In this adaptation you place 14 nature tiles on a 5x5 grid representing five habitats: meadow, forest, lake, sand, and pond. Click any empty cell to place the next tile from the queue. Each placement scores 1 base point plus 1 per orthogonally adjacent same-habitat tile. Strategy: build connecting habitat paths so similar terrain forms continuous regions. With 14 tiles spread over five types you average just under three of each, so two well-placed clusters can dominate scoring. Paths emerge naturally when you extend existing clusters across the board. After all placements the game finalises with adjacency bonuses. A typical Meadow: Paths score is 24-32 points; an excellent path-builder can reach 38+. Random queues guarantee each meadow's terrain unfolds unpredictably.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as MeadowPathsSettings),
  reducer,
  isTerminal,
  component: MeadowPathsGame,
};
