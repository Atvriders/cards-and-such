import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { CascadiaHabitatState, CascadiaHabitatAction, CascadiaHabitatSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CascadiaHabitatGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const cascadiaHabitatPlugin: GamePlugin<CascadiaHabitatState, CascadiaHabitatAction, typeof settings> = {
  id: "cascadia-habitat",
  title: "Cascadia Habitat",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Cascadia-style habitat tile/animal placement on a 5x5 grid.",
  howToPlay: `Cascadia is a habitat-and-wildlife game where you place tiles and tokens to score corridors. In this adaptation, place 16 randomly-drawn habitat tiles on a 5x5 grid. Each tile shows one of five habitats: forest, river, mountain, prairie, or wetland.

Click any empty cell to place the next tile.

Scoring at game end:
• Forest: +2 per tile in its largest forest group (orthogonally connected).
• River: +3 per river tile in a horizontal or vertical line of 3+.
• Mountain: +1 per mountain, +5 bonus if you have 3+ mountains.
• Prairie: +2 per prairie pair (each pair of orthogonally adjacent prairies scores once).
• Wetland: +1 per wetland; +4 bonus if you have wetlands in 3+ different rows.

Forests want big clusters. Rivers want straight lines. Mountains want a small set. Prairies want couples. Wetlands want spread.

A strong Cascadia habitat scores 35-50 points. The trick is recognizing which terrain dominated your random draws and shaping the rest around it. Click placements are non-undoable, so plan a few ahead.`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CascadiaHabitatSettings),
  reducer,
  isTerminal,
  component: CascadiaHabitatGame,
};
