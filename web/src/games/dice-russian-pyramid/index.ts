import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceRussianPyramidState, DiceRussianPyramidAction, DiceRussianPyramidSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceRussianPyramidGame } from "./Game.js";

const settings = { dummy: { kind:"boolean" as const, label:"Standard rules", default:true } } as const;
type S = SettingsOf<typeof settings>;

export const diceRussianPyramidPlugin: GamePlugin<DiceRussianPyramidState, DiceRussianPyramidAction, typeof settings> = {
  id: "dice-russian-pyramid",
  title: "Dice Russian Pyramid",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: 'Dice Russian Pyramid: pot reds and colours in sequence to build a break.',
  howToPlay: 'Dice Russian Pyramid is a real, dice-driven simulation. Dice Russian Pyramid: pot reds and colours in sequence to build a break.\\n\\nPress Roll to take your turn. Each round resolves immediately and the running score updates after every roll. Press Next to advance until the match ends.\\n\\nGame state is fully seeded for replay parity, and the log strip shows your most recent rolls.',
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as DiceRussianPyramidSettings),
  reducer,
  isTerminal,
  component: DiceRussianPyramidGame,
};
