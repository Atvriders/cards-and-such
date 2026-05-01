import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceAroundClockState, DiceAroundClockAction, DiceAroundClockSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceAroundClockGame } from "./Game.js";

const settings = { dummy: { kind:"boolean" as const, label:"Standard rules", default:true } } as const;
type S = SettingsOf<typeof settings>;

export const diceAroundClockPlugin: GamePlugin<DiceAroundClockState, DiceAroundClockAction, typeof settings> = {
  id: "dice-around-clock",
  title: "Dice Around the Clock",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: 'Dice Around the Clock: hit 1 through 20 in order, then bullseye.',
  howToPlay: 'Dice Around the Clock is a real, dice-driven simulation. Dice Around the Clock: hit 1 through 20 in order, then bullseye.\\n\\nPress Roll to take your turn. Each round resolves immediately and the running score updates after every roll. Press Next to advance until the match ends.\\n\\nGame state is fully seeded for replay parity, and the log strip shows your most recent rolls.',
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as DiceAroundClockSettings),
  reducer,
  isTerminal,
  component: DiceAroundClockGame,
};
