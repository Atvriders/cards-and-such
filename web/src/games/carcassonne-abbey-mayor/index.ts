import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { CarcassonneAbbeyMayorState, CarcassonneAbbeyMayorAction, CarcassonneAbbeyMayorSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CarcassonneAbbeyMayorGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const carcassonneAbbeyMayorPlugin: GamePlugin<CarcassonneAbbeyMayorState, CarcassonneAbbeyMayorAction, typeof settings> = {
  id: "carcassonne-abbey-mayor",
  title: "Carcassonne: Abbey & Mayor",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Abbey, mayor, garden, barn, and city-shield tile placement.",
  howToPlay: "Carcassonne: Abbey & Mayor adds abbeys (alternative monasteries), mayors (city-shield scorers), abbots (garden scorers), and barns (field scorers). In this adaptation 16 tiles drawn from these themes plus city-shields fill a 5x5 grid. Click any empty cell to place the next tile from the queue. Each placement earns 1 base point plus 1 per orthogonally adjacent same-type tile. Mayor and shield clusters traditionally score together — keep them close on the board. Abbeys score best when isolated thematically, but here the same adjacency rule applies, encouraging clustering. After all 16 tiles are placed the score is finalised including all adjacencies. With six types and 16 tiles you can expect 3-4 placements per type, allowing two strong clusters. A solid score is 30-40; clusterers reach 45+. Random queue means each session presents a fresh placement puzzle.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CarcassonneAbbeyMayorSettings),
  reducer,
  isTerminal,
  component: CarcassonneAbbeyMayorGame,
};
