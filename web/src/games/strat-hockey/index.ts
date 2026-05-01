import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { StratHockeyState, StratHockeyAction, StratHockeySettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { StratHockeyGame } from "./Game.js";

const settings = { dummy: { kind:"boolean" as const, label:"Standard rules", default:true } } as const;
type S = SettingsOf<typeof settings>;

export const stratHockeyPlugin: GamePlugin<StratHockeyState, StratHockeyAction, typeof settings> = {
  id: "strat-hockey",
  title: "Strat-O-Matic Hockey",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: 'Strat-O-Matic Hockey: 3 periods of dice-driven shifts; outscore the CPU.',
  howToPlay: 'Strat-O-Matic Hockey is a real, dice-driven simulation. Strat-O-Matic Hockey: 3 periods of dice-driven shifts; outscore the CPU.\\n\\nPress Roll to take your turn. Each round resolves immediately and the running score updates after every roll. Press Next to advance until the match ends.\\n\\nGame state is fully seeded for replay parity, and the log strip shows your most recent rolls.',
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as StratHockeySettings),
  reducer,
  isTerminal,
  component: StratHockeyGame,
};
