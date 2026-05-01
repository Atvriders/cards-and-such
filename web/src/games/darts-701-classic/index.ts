import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { Darts701ClassicState, Darts701ClassicAction, Darts701ClassicSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Darts701ClassicGame } from "./Game.js";

const settings = { dummy: { kind:"boolean" as const, label:"Standard rules", default:true } } as const;
type S = SettingsOf<typeof settings>;

export const darts701ClassicPlugin: GamePlugin<Darts701ClassicState, Darts701ClassicAction, typeof settings> = {
  id: "darts-701-classic",
  title: "Classic 701 Darts",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: 'Classic 701 Darts: count down from 701 to exactly 0 with simulated darts.',
  howToPlay: 'Classic 701 Darts is a real, dice-driven simulation. Classic 701 Darts: count down from 701 to exactly 0 with simulated darts.\\n\\nPress Roll to take your turn. Each round resolves immediately and the running score updates after every roll. Press Next to advance until the match ends.\\n\\nGame state is fully seeded for replay parity, and the log strip shows your most recent rolls.',
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as Darts701ClassicSettings),
  reducer,
  isTerminal,
  component: Darts701ClassicGame,
};
