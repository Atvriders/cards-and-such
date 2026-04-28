import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { HarvestDiceGardenState, HarvestDiceGardenAction, HarvestDiceGardenSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { HarvestDiceGardenGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const harvestDiceGardenPlugin: GamePlugin<HarvestDiceGardenState, HarvestDiceGardenAction, typeof settings> = {
  id: "harvest-dice-garden",
  title: "Harvest Dice",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Roll dice to plant a 4x4 garden; sell or feed the pig, never waste.",
  howToPlay: `Harvest Dice is a garden roll-and-write. In this adaptation you roll 1d6 each turn (12 rolls total). The roll's value (1-6) maps to a vegetable:

• 1: carrot, 2: tomato, 3: lettuce, 4: pumpkin, 5: cabbage, 6: pig (no plant — feeds the pig)

Click any empty cell of the 4x4 garden to plant. If you roll a 6, click any cell to feed the pig (overwriting that cell with a pig token).

Scoring (at end):
• Each veg cell scores points equal to its veg value (carrots = 1, ..., cabbage = 5)
• Pig cells score +2 each, +3 bonus per row with no veg (pig pen complete)
• Bonus +5 per row containing all 4 different veg types (no pig)
• Bonus +10 if total garden is filled (16 of 16 cells, including pigs)

The game runs 12 rolls. Pigs are the wildcard — they can fill awkward cells. Aim for diverse rows when veg comes; cluster pigs into single rows when sixes appear. A strong Harvest Dice run scores 30-50 points.`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as HarvestDiceGardenSettings),
  reducer,
  isTerminal,
  component: HarvestDiceGardenGame,
};
