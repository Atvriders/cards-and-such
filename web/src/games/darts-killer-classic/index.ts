import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { DartsKillerClassicState, DartsKillerClassicAction, DartsKillerClassicSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DartsKillerClassicGame } from "./Game.js";

const settings = { dummy: { kind:"boolean" as const, label:"Standard rules", default:true } } as const;
type S = SettingsOf<typeof settings>;

export const dartsKillerClassicPlugin: GamePlugin<DartsKillerClassicState, DartsKillerClassicAction, typeof settings> = {
  id: "darts-killer-classic",
  title: "Classic Killer Darts",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: 'Classic Killer Darts: claim a number, become Killer at 5 lives, defeat opponents to win.',
  howToPlay: 'Classic Killer Darts is a real, dice-driven simulation. Classic Killer Darts: claim a number, become Killer at 5 lives, defeat opponents to win.\\n\\nPress Roll to take your turn. Each round resolves immediately and the running score updates after every roll. Press Next to advance until the match ends.\\n\\nGame state is fully seeded for replay parity, and the log strip shows your most recent rolls.',
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as DartsKillerClassicSettings),
  reducer,
  isTerminal,
  component: DartsKillerClassicGame,
};
