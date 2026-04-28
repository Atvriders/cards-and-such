import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { CleverDiceState, CleverDiceAction, CleverDiceSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CleverDiceGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const cleverDicePlugin: GamePlugin<CleverDiceState, CleverDiceAction, typeof settings> = {
  id: "clever-dice",
  title: "Clever Dice",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Multi-color dice cross-chain scoring on a 4x4 sheet.",
  howToPlay: `Ganz Schön Clever (Clever) is a roll-and-write where colored dice cross-trigger bonuses. In this simplified adaptation you have a 4x4 grid divided into 4 colored quadrants (yellow top-left, blue top-right, green bottom-left, orange bottom-right), each 2x2.

Each turn you roll 1d6 and a color die (Y/B/G/O). Click any empty cell of the rolled color to mark it, scoring the d6 value. Triggering: marking a yellow cell grants a free blue mark on the next turn (any 1-value); marking a blue grants free green; etc.

Scoring (at end):
• Each cell scores its d6 mark value (1-6)
• Bonus +5 per fully-completed quadrant (4 cells)
• Bonus +10 if all 4 quadrants have at least 1 marked cell (variety)
• Chain bonus: +2 per turn where you used a free trigger from previous turn

The game runs 12 rolls. Target dice that trigger chains. A strong run scores 35-55 points. The trigger system is the heart — milk it for compound rewards.`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CleverDiceSettings),
  reducer,
  isTerminal,
  component: CleverDiceGame,
};
