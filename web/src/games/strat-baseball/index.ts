import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { StratBaseballState, StratBaseballAction, StratBaseballSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { StratBaseballGame } from "./Game.js";

const settings = { dummy: { kind:"boolean" as const, label:"Standard rules", default:true } } as const;
type S = SettingsOf<typeof settings>;

export const stratBaseballPlugin: GamePlugin<StratBaseballState, StratBaseballAction, typeof settings> = {
  id: "strat-baseball",
  title: "Strat-O-Matic Baseball",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: 'Strat-O-Matic Baseball: play 9 innings of dice-driven at-bats. Outscore the CPU.',
  howToPlay: 'Strat-O-Matic Baseball is a real, dice-driven simulation. Strat-O-Matic Baseball: play 9 innings of dice-driven at-bats. Outscore the CPU.\\n\\nPress Roll to take your turn. Each round resolves immediately and the running score updates after every roll. Press Next to advance until the match ends.\\n\\nGame state is fully seeded for replay parity, and the log strip shows your most recent rolls.',
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as StratBaseballSettings),
  reducer,
  isTerminal,
  component: StratBaseballGame,
};
