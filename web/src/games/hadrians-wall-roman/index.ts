import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { HadriansWallRomanState, HadriansWallRomanAction, HadriansWallRomanSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { HadriansWallRomanGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const hadriansWallRomanPlugin: GamePlugin<HadriansWallRomanState, HadriansWallRomanAction, typeof settings> = {
  id: "hadrians-wall-roman",
  title: "Hadrian's Wall",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Construct a Roman fort on a 5x5 wall sheet via dice rolls.",
  howToPlay: `Hadrian's Wall is a flip-and-write Roman fort builder. In this adaptation you have a 5x5 fort plan and 14 dice rolls. Each turn roll 2 dice; the sum determines what type of structure you can build:

• Sum 2-3: tower (T)
• Sum 4-5: barracks (B)
• Sum 6-7: granary (G)
• Sum 8-9: vineyard (V)
• Sum 10-12: road (R)

Click any empty cell to place the structure.

Scoring (at end):
• Towers: +5 each, +3 bonus if on the perimeter
• Barracks: +3 each, +2 per orthogonal road neighbor
• Granaries: +4 each, but only if there are 2+ on the board (food economy needs scale)
• Vineyards: +2 each, +1 per other vineyard in the same row
• Roads: +1 each, +1 per orthogonal road neighbor (long roads = continuous)

The game runs 14 rolls. A balanced fort with a road network and several towers scores 35-55 points. Edge towers and connected roads form the backbone. A pure granary fort fails because of the 2+ requirement on a single granary.`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as HadriansWallRomanSettings),
  reducer,
  isTerminal,
  component: HadriansWallRomanGame,
};
