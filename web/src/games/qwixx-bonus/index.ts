import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { QwixxBonusState, QwixxBonusAction, QwixxBonusSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { QwixxBonusGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const qwixxBonusPlugin: GamePlugin<QwixxBonusState, QwixxBonusAction, typeof settings> = {
  id: "qwixx-bonus",
  title: "Qwixx: Bonus Dice",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Qwixx variant adding a bonus die for combo rolls.",
  howToPlay: "Qwixx: Bonus Dice is a Qwixx variant where an additional bonus die widens combo possibilities. The 4x4 grid is your row-locking sheet.\n\nEach round, click Roll to draw a primary die plus implied bonus (here represented as one pip 1-6). Click any empty cell to apply the value. Skip when nothing useful is rolled.\n\nScoring:\n- Each cell scores its pip value (1-6).\n- +5 per row fully crossed (locked).\n- +5 per column fully crossed (combo'd).\n- +10 for full sheet (the perfect Qwixx).\n\n12 rolls available. Bonus Dice pushes Qwixx toward greater density: every roll has potential. Strategy: prioritize cells that are one mark away from completing a row+column intersection. A solid run scores 35-55; bonus mastery reaches 65+. Qwixx: Bonus Dice is for veterans of the original who want more decisions per roll. The bonus die means fewer wasted rolls, but also more scoring pressure. Track where each pip lands across the rolling cascade.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as QwixxBonusSettings),
  reducer,
  isTerminal,
  component: QwixxBonusGame,
};
