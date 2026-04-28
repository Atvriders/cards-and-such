import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { Trek12HimalayaState, Trek12HimalayaAction, Trek12HimalayaSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Trek12HimalayaGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const trek12HimalayaPlugin: GamePlugin<Trek12HimalayaState, Trek12HimalayaAction, typeof settings> = {
  id: "trek-12-himalaya",
  title: "Trek 12: Himalaya",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Roll dice, choose +/-/×, place result on a 4x4 Himalayan trek map.",
  howToPlay: `Trek 12 is a math-driven roll-and-write across the Himalayas. In this adaptation you have a 4x4 trek map with 16 cells. Each turn you roll 2 dice (1d6 each) and choose an operation:

• Add (sum, range 2-12)
• Subtract (absolute difference, range 0-5)
• Multiply (product, range 1-36)

Click any empty cell to place the chosen result there.

Scoring (at end):
• Each cell holds its placed value as raw points
• Bonus +5 per row whose values are STRICTLY ASCENDING left to right
• Bonus +5 per column whose values are STRICTLY ASCENDING top to bottom
• Penalty −3 per row that has a value > 30 (overflow, mountain too steep)
• Bonus +10 if every cell is filled (full trek)

The game runs 12 rolls. With 12 cells filled out of 16, you can complete some rows or columns. The choice of operation is the strategy — early on use products to plant peaks; later use differences to fill low spots. A strong Trek 12 run scores 60-90 points.`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as Trek12HimalayaSettings),
  reducer,
  isTerminal,
  component: Trek12HimalayaGame,
};
