import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceStratHockeyState, DiceStratHockeyAction, DiceStratHockeySettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceStratHockeyGame } from "./Game.js";

const settings = { dummy: { kind:"boolean" as const, label:"Standard rules", default:true } } as const;
type S = SettingsOf<typeof settings>;

export const diceStratHockeyPlugin: GamePlugin<DiceStratHockeyState, DiceStratHockeyAction, typeof settings> = {
  id: "dice-strat-hockey",
  title: "Dice Strat Hockey",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: 'Dice Strat Hockey: 3 periods of dice-driven shifts; outscore the CPU.',
  howToPlay: 'Dice Strat Hockey is a real, dice-driven simulation. Dice Strat Hockey: 3 periods of dice-driven shifts; outscore the CPU.\\n\\nPress Roll to take your turn. Each round resolves immediately and the running score updates after every roll. Press Next to advance until the match ends.\\n\\nGame state is fully seeded for replay parity, and the log strip shows your most recent rolls.',
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as DiceStratHockeySettings),
  reducer,
  isTerminal,
  component: DiceStratHockeyGame,
};
