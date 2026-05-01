import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { DicePursuePennantState, DicePursuePennantAction, DicePursuePennantSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DicePursuePennantGame } from "./Game.js";

const settings = { dummy: { kind:"boolean" as const, label:"Standard rules", default:true } } as const;
type S = SettingsOf<typeof settings>;

export const dicePursuePennantPlugin: GamePlugin<DicePursuePennantState, DicePursuePennantAction, typeof settings> = {
  id: "dice-pursue-pennant",
  title: "Dice Pursue Pennant",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: 'Dice Pursue Pennant: play 9 innings of dice-driven at-bats. Outscore the CPU.',
  howToPlay: 'Dice Pursue Pennant is a real, dice-driven simulation. Dice Pursue Pennant: play 9 innings of dice-driven at-bats. Outscore the CPU.\\n\\nPress Roll to take your turn. Each round resolves immediately and the running score updates after every roll. Press Next to advance until the match ends.\\n\\nGame state is fully seeded for replay parity, and the log strip shows your most recent rolls.',
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as DicePursuePennantSettings),
  reducer,
  isTerminal,
  component: DicePursuePennantGame,
};
