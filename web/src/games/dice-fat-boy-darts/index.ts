import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceFatBoyDartsState, DiceFatBoyDartsAction, DiceFatBoyDartsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceFatBoyDartsGame } from "./Game.js";

const settings = { dummy: { kind:"boolean" as const, label:"Standard rules", default:true } } as const;
type S = SettingsOf<typeof settings>;

export const diceFatBoyDartsPlugin: GamePlugin<DiceFatBoyDartsState, DiceFatBoyDartsAction, typeof settings> = {
  id: "dice-fat-boy-darts",
  title: "Dice Fat Boy Darts",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: 'Fat Boy Darts: chase a target score by accumulating points each round.',
  howToPlay: 'Dice Fat Boy Darts is a real, dice-driven simulation. Fat Boy Darts: chase a target score by accumulating points each round.\\n\\nPress Roll to take your turn. Each round resolves immediately and the running score updates after every roll. Press Next to advance until the match ends.\\n\\nGame state is fully seeded for replay parity, and the log strip shows your most recent rolls.',
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as DiceFatBoyDartsSettings),
  reducer,
  isTerminal,
  component: DiceFatBoyDartsGame,
};
