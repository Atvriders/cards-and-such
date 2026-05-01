import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { StratBasketballState, StratBasketballAction, StratBasketballSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { StratBasketballGame } from "./Game.js";

const settings = { dummy: { kind:"boolean" as const, label:"Standard rules", default:true } } as const;
type S = SettingsOf<typeof settings>;

export const stratBasketballPlugin: GamePlugin<StratBasketballState, StratBasketballAction, typeof settings> = {
  id: "strat-basketball",
  title: "Strat-O-Matic Basketball",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: 'Strat-O-Matic Basketball: 4 quarters of dice-driven possessions; outscore the CPU.',
  howToPlay: 'Strat-O-Matic Basketball is a real, dice-driven simulation. Strat-O-Matic Basketball: 4 quarters of dice-driven possessions; outscore the CPU.\\n\\nPress Roll to take your turn. Each round resolves immediately and the running score updates after every roll. Press Next to advance until the match ends.\\n\\nGame state is fully seeded for replay parity, and the log strip shows your most recent rolls.',
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as StratBasketballSettings),
  reducer,
  isTerminal,
  component: StratBasketballGame,
};
