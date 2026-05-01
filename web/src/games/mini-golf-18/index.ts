import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { MiniGolf18State, MiniGolf18Action, MiniGolf18Settings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MiniGolf18Game } from "./Game.js";

const settings = { dummy: { kind:"boolean" as const, label:"Standard rules", default:true } } as const;
type S = SettingsOf<typeof settings>;

export const miniGolf18Plugin: GamePlugin<MiniGolf18State, MiniGolf18Action, typeof settings> = {
  id: "mini-golf-18",
  title: "Mini Golf 18",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: 'Mini Golf: 18 holes, par 3 each; lowest stroke total wins.',
  howToPlay: 'Mini Golf 18 is a real, dice-driven simulation. Mini Golf: 18 holes, par 3 each; lowest stroke total wins.\\n\\nPress Roll to take your turn. Each round resolves immediately and the running score updates after every roll. Press Next to advance until the match ends.\\n\\nGame state is fully seeded for replay parity, and the log strip shows your most recent rolls.',
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as MiniGolf18Settings),
  reducer,
  isTerminal,
  component: MiniGolf18Game,
};
