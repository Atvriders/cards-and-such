import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { QuoitsTossState, QuoitsTossAction, QuoitsTossSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { QuoitsTossGame } from "./Game.js";

const settings = { dummy: { kind:"boolean" as const, label:"Standard rules", default:true } } as const;
type S = SettingsOf<typeof settings>;

export const quoitsTossPlugin: GamePlugin<QuoitsTossState, QuoitsTossAction, typeof settings> = {
  id: "quoits-toss",
  title: "Quoits Toss",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: 'Quoits Toss: throw to score; bag/ring on board = points; race to 21.',
  howToPlay: 'Quoits Toss is a real, dice-driven simulation. Quoits Toss: throw to score; bag/ring on board = points; race to 21.\\n\\nPress Roll to take your turn. Each round resolves immediately and the running score updates after every roll. Press Next to advance until the match ends.\\n\\nGame state is fully seeded for replay parity, and the log strip shows your most recent rolls.',
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as QuoitsTossSettings),
  reducer,
  isTerminal,
  component: QuoitsTossGame,
};
