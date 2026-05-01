import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceGulfDartsState, DiceGulfDartsAction, DiceGulfDartsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceGulfDartsGame } from "./Game.js";

const settings = { dummy: { kind:"boolean" as const, label:"Standard rules", default:true } } as const;
type S = SettingsOf<typeof settings>;

export const diceGulfDartsPlugin: GamePlugin<DiceGulfDartsState, DiceGulfDartsAction, typeof settings> = {
  id: "dice-gulf-darts",
  title: "Dice Gulf Darts",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: 'Gulf-style golf darts: 9 holes, low score wins.',
  howToPlay: 'Dice Gulf Darts is a real, dice-driven simulation. Gulf-style golf darts: 9 holes, low score wins.\\n\\nPress Roll to take your turn. Each round resolves immediately and the running score updates after every roll. Press Next to advance until the match ends.\\n\\nGame state is fully seeded for replay parity, and the log strip shows your most recent rolls.',
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as DiceGulfDartsSettings),
  reducer,
  isTerminal,
  component: DiceGulfDartsGame,
};
