import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceCricketDartsState, DiceCricketDartsAction, DiceCricketDartsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceCricketDartsGame } from "./Game.js";

const settings = { dummy: { kind:"boolean" as const, label:"Standard rules", default:true } } as const;
type S = SettingsOf<typeof settings>;

export const diceCricketDartsPlugin: GamePlugin<DiceCricketDartsState, DiceCricketDartsAction, typeof settings> = {
  id: "dice-cricket-darts",
  title: "Dice Cricket Darts",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: 'Dice Cricket Darts: close out 15-20 and bullseye three times each, score on closed numbers.',
  howToPlay: 'Dice Cricket Darts is a real, dice-driven simulation. Dice Cricket Darts: close out 15-20 and bullseye three times each, score on closed numbers.\\n\\nPress Roll to take your turn. Each round resolves immediately and the running score updates after every roll. Press Next to advance until the match ends.\\n\\nGame state is fully seeded for replay parity, and the log strip shows your most recent rolls.',
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as DiceCricketDartsSettings),
  reducer,
  isTerminal,
  component: DiceCricketDartsGame,
};
