import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { PursuePennantState, PursuePennantAction, PursuePennantSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PursuePennantGame } from "./Game.js";

const settings = { dummy: { kind:"boolean" as const, label:"Standard rules", default:true } } as const;
type S = SettingsOf<typeof settings>;

export const pursuePennantPlugin: GamePlugin<PursuePennantState, PursuePennantAction, typeof settings> = {
  id: "pursue-pennant",
  title: "Pursue the Pennant",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: 'Pursue the Pennant: play 9 innings of dice-driven at-bats. Outscore the CPU.',
  howToPlay: 'Pursue the Pennant is a real, dice-driven simulation. Pursue the Pennant: play 9 innings of dice-driven at-bats. Outscore the CPU.\\n\\nPress Roll to take your turn. Each round resolves immediately and the running score updates after every roll. Press Next to advance until the match ends.\\n\\nGame state is fully seeded for replay parity, and the log strip shows your most recent rolls.',
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as PursuePennantSettings),
  reducer,
  isTerminal,
  component: PursuePennantGame,
};
