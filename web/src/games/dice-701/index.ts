import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { Dice701State, Dice701Action, Dice701Settings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Dice701Game } from "./Game.js";

const settings = { dummy: { kind:"boolean" as const, label:"Standard rules", default:true } } as const;
type S = SettingsOf<typeof settings>;

export const dice701Plugin: GamePlugin<Dice701State, Dice701Action, typeof settings> = {
  id: "dice-701",
  title: "Dice 701",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: 'Dice 701: count down from 701 to exactly 0 with simulated darts.',
  howToPlay: 'Dice 701 is a real, dice-driven simulation. Dice 701: count down from 701 to exactly 0 with simulated darts.\\n\\nPress Roll to take your turn. Each round resolves immediately and the running score updates after every roll. Press Next to advance until the match ends.\\n\\nGame state is fully seeded for replay parity, and the log strip shows your most recent rolls.',
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as Dice701Settings),
  reducer,
  isTerminal,
  component: Dice701Game,
};
