import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceCarromState, DiceCarromAction, DiceCarromSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceCarromGame } from "./Game.js";

const settings = { dummy: { kind:"boolean" as const, label:"Standard rules", default:true } } as const;
type S = SettingsOf<typeof settings>;

export const diceCarromPlugin: GamePlugin<DiceCarromState, DiceCarromAction, typeof settings> = {
  id: "dice-carrom",
  title: "Dice Carrom",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: 'Dice Carrom: flick discs to score in scoring rings or pockets.',
  howToPlay: 'Dice Carrom is a real, dice-driven simulation. Dice Carrom: flick discs to score in scoring rings or pockets.\\n\\nPress Roll to take your turn. Each round resolves immediately and the running score updates after every roll. Press Next to advance until the match ends.\\n\\nGame state is fully seeded for replay parity, and the log strip shows your most recent rolls.',
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as DiceCarromSettings),
  reducer,
  isTerminal,
  component: DiceCarromGame,
};
