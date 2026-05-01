import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceShanghaiDartsState, DiceShanghaiDartsAction, DiceShanghaiDartsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceShanghaiDartsGame } from "./Game.js";

const settings = { dummy: { kind:"boolean" as const, label:"Standard rules", default:true } } as const;
type S = SettingsOf<typeof settings>;

export const diceShanghaiDartsPlugin: GamePlugin<DiceShanghaiDartsState, DiceShanghaiDartsAction, typeof settings> = {
  id: "dice-shanghai-darts",
  title: "Dice Shanghai Darts",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: 'Shanghai Darts: hit single, double, and triple of the round number to Shanghai.',
  howToPlay: 'Dice Shanghai Darts is a real, dice-driven simulation. Shanghai Darts: hit single, double, and triple of the round number to Shanghai.\\n\\nPress Roll to take your turn. Each round resolves immediately and the running score updates after every roll. Press Next to advance until the match ends.\\n\\nGame state is fully seeded for replay parity, and the log strip shows your most recent rolls.',
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as DiceShanghaiDartsSettings),
  reducer,
  isTerminal,
  component: DiceShanghaiDartsGame,
};
